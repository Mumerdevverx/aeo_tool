import httpx
from bs4 import BeautifulSoup
import urllib.parse
import time
import re

async def scrape_website(url: str) -> dict:
    """
    Scrapes a target website and extracts structural details for AI Search Visibility Auditing.
    """
    # Standardize URL
    parsed_url = urllib.parse.urlparse(url)
    if not parsed_url.scheme:
        url = "https://" + url
        parsed_url = urllib.parse.urlparse(url)
    
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    result = {
        "url": url,
        "base_url": base_url,
        "status_code": 200,
        "load_time_ms": 0,
        "ssl_enabled": url.startswith("https://"),
        "robots_txt": {"checked": False, "found": False, "blocks_ai": False, "content": ""},
        "sitemap_xml": {"found": False, "url": ""},
        "canonical": {"found": False, "href": "", "matches": False},
        "indexing": {"robots_meta": "", "googlebot_meta": "", "noindex": False},
        "schemas": [],
        "entities": {"brand_mentions": [], "founder_mentions": [], "services": [], "location": "", "same_as": []},
        "content_structure": {"headings": [], "semantic_html": {}, "faq_count": 0, "word_count": 0},
        "trust_signals": {"about_link": False, "contact_link": False, "testimonials_found": False, "reviews_found": False},
        "performance": {"page_size_kb": 0, "speed_grade": "A"}
    }
    
    # 1. Fetch Robots.txt
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            robots_url = f"{base_url}/robots.txt"
            robots_response = await client.get(robots_url, headers=headers)
            result["robots_txt"]["checked"] = True
            if robots_response.status_code == 200:
                result["robots_txt"]["found"] = True
                content = robots_response.text
                result["robots_txt"]["content"] = content
                
                # Check if common AI bots are disallowed
                ai_bots = ["gptbot", "chatgpt-user", "google-extended", "claudebot", "perplexitybot", "ccbot", "anthropic-ai"]
                blocks_ai = False
                lines = content.lower().split("\n")
                current_user_agent = ""
                for line in lines:
                    line = line.strip()
                    if line.startswith("user-agent:"):
                        current_user_agent = line.replace("user-agent:", "").strip()
                    elif line.startswith("disallow:"):
                        disallow_val = line.replace("disallow:", "").strip()
                        if disallow_val == "/" or disallow_val == "":
                            # disallow all for specific AI bot
                            if any(bot in current_user_agent for bot in ai_bots) or current_user_agent == "*":
                                if disallow_val == "/":
                                    blocks_ai = True
                result["robots_txt"]["blocks_ai"] = blocks_ai
        except Exception as e:
            result["robots_txt"]["error"] = str(e)
            
        # 2. Fetch main URL content
        start_time = time.time()
        try:
            response = await client.get(url, headers=headers)
            result["load_time_ms"] = int((time.time() - start_time) * 1000)
            result["status_code"] = response.status_code
            html_content = response.text
            result["performance"]["page_size_kb"] = round(len(response.content) / 1024, 2)
        except Exception as e:
            result["status_code"] = 500
            result["load_time_ms"] = int((time.time() - start_time) * 1000)
            result["error"] = str(e)
            return result

    if response.status_code != 200:
        return result

    # Analyze HTML
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Title & Meta Description
    title_tag = soup.find("title")
    meta_desc = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    result["title"] = title_tag.get_text().strip() if title_tag else ""
    result["description"] = meta_desc["content"].strip() if (meta_desc and meta_desc.has_attr("content")) else ""
    
    # 3. Sitemap Check
    sitemap_link = soup.find("link", attrs={"rel": "sitemap"})
    if sitemap_link and sitemap_link.has_attr("href"):
        result["sitemap_xml"]["found"] = True
        result["sitemap_xml"]["url"] = sitemap_link["href"]
    else:
        # Check standard location in robots.txt content
        if "sitemap:" in result["robots_txt"]["content"].lower():
            sitemap_match = re.search(r"sitemap:\s*(https?://[^\s]+)", result["robots_txt"]["content"], re.I)
            if sitemap_match:
                result["sitemap_xml"]["found"] = True
                result["sitemap_xml"]["url"] = sitemap_match.group(1)
        if not result["sitemap_xml"]["found"]:
            result["sitemap_xml"]["url"] = f"{base_url}/sitemap.xml"
            # We don't fetch it to keep audit fast, but note the standard URL

    # 4. Canonical Tags
    canonical_tag = soup.find("link", attrs={"rel": "canonical"})
    if canonical_tag and canonical_tag.has_attr("href"):
        result["canonical"]["found"] = True
        result["canonical"]["href"] = canonical_tag["href"]
        # Allow slight differences like trailing slash
        clean_url = url.rstrip('/')
        clean_canonical = canonical_tag["href"].rstrip('/')
        result["canonical"]["matches"] = clean_url == clean_canonical

    # 5. Indexing Meta Tags
    robots_meta = soup.find("meta", attrs={"name": "robots"})
    if robots_meta and robots_meta.has_attr("content"):
        content_val = robots_meta["content"].lower()
        result["indexing"]["robots_meta"] = robots_meta["content"]
        if "noindex" in content_val:
            result["indexing"]["noindex"] = True

    googlebot_meta = soup.find("meta", attrs={"name": "googlebot"})
    if googlebot_meta and googlebot_meta.has_attr("content"):
        content_val = googlebot_meta["content"].lower()
        result["indexing"]["googlebot_meta"] = googlebot_meta["content"]
        if "noindex" in content_val:
            result["indexing"]["noindex"] = True

    # 6. Structured Data / Schema Extraction
    schema_scripts = soup.find_all("script", type="application/ld+json")
    import json
    for script in schema_scripts:
        try:
            schema_data = json.loads(script.string)
            if isinstance(schema_data, dict):
                # Sometimes it is a @graph array or a nested object
                if "@type" in schema_data:
                    result["schemas"].append(schema_data["@type"])
                elif "@graph" in schema_data:
                    for item in schema_data["@graph"]:
                        if "@type" in item:
                            result["schemas"].append(item["@type"])
            elif isinstance(schema_data, list):
                for item in schema_data:
                    if isinstance(item, dict) and "@type" in item:
                        result["schemas"].append(item["@type"])
        except Exception:
            continue

    # Flatten nested schemas lists if any
    flattened_schemas = []
    for s in result["schemas"]:
        if isinstance(s, list):
            flattened_schemas.extend(s)
        else:
            flattened_schemas.append(s)
    result["schemas"] = list(set(flattened_schemas))

    # 7. Entity Recognition signals
    # Look for Founder, Organization, Brand properties in Schema
    for script in schema_scripts:
        try:
            schema_data = json.loads(script.string)
            # Recursively check dictionary for key fields
            def traverse_schema(obj):
                if isinstance(obj, dict):
                    if obj.get("@type") in ["Organization", "Brand", "Corporation", "LocalBusiness"]:
                        if "name" in obj:
                            result["entities"]["brand_mentions"].append(obj["name"])
                        if "sameAs" in obj:
                            val = obj["sameAs"]
                            if isinstance(val, list):
                                result["entities"]["same_as"].extend(val)
                            else:
                                result["entities"]["same_as"].append(val)
                        if "founder" in obj:
                            founder = obj["founder"]
                            if isinstance(founder, dict) and "name" in founder:
                                result["entities"]["founder_mentions"].append(founder["name"])
                            elif isinstance(founder, str):
                                result["entities"]["founder_mentions"].append(founder)
                    for k, v in obj.items():
                        traverse_schema(v)
                elif isinstance(obj, list):
                    for item in obj:
                        traverse_schema(item)
            traverse_schema(schema_data)
        except Exception:
            pass

    # Extract text content for entity fallback scans
    body_text = soup.body.get_text(" ", strip=True) if soup.body else ""
    result["content_structure"]["word_count"] = len(body_text.split())

    # Look for about/contact page links
    for a in soup.find_all("a", href=True):
        href = a["href"].lower()
        text = a.get_text().lower()
        if "about" in href or "about" in text:
            result["trust_signals"]["about_link"] = True
        if "contact" in href or "contact" in text or "support" in href:
            result["trust_signals"]["contact_link"] = True

    # Trust signal keywords in body text
    body_lower = body_text.lower()
    if "testimonial" in body_lower or "what client say" in body_lower or "what our customers say" in body_lower:
        result["trust_signals"]["testimonials_found"] = True
    if "review" in body_lower or "trustpilot" in body_lower or "g2" in body_lower or "capterra" in body_lower:
        result["trust_signals"]["reviews_found"] = True

    # 8. Content Structure & Heading Hierarchy
    headings = []
    for h_tag in ["h1", "h2", "h3", "h4", "h5", "h6"]:
        for el in soup.find_all(h_tag):
            headings.append({
                "tag": h_tag.upper(),
                "text": el.get_text().strip()
            })
    result["content_structure"]["headings"] = headings

    # FAQ checks
    faq_schemas = [s for s in result["schemas"] if "FAQPage" in s or "FAQ" in s]
    faq_classes = soup.find_all(class_=re.compile(r"faq|accordion|question|answer", re.I))
    result["content_structure"]["faq_count"] = len(faq_schemas) + (len(faq_classes) // 2)

    # Semantic HTML Tags
    semantic_tags = ["header", "nav", "main", "article", "section", "aside", "footer"]
    for tag in semantic_tags:
        result["content_structure"]["semantic_html"][tag] = len(soup.find_all(tag)) > 0

    # 9. Clean up and deduplicate sameAs, brand and founder mentions
    result["entities"]["brand_mentions"] = list(set(result["entities"]["brand_mentions"]))
    result["entities"]["founder_mentions"] = list(set(result["entities"]["founder_mentions"]))
    result["entities"]["same_as"] = list(set(result["entities"]["same_as"]))

    # Add quick speed rating based on response load time
    if result["load_time_ms"] < 600:
        result["performance"]["speed_grade"] = "A"
    elif result["load_time_ms"] < 1500:
        result["performance"]["speed_grade"] = "B"
    elif result["load_time_ms"] < 2500:
        result["performance"]["speed_grade"] = "C"
    elif result["load_time_ms"] < 4000:
        result["performance"]["speed_grade"] = "D"
    else:
        result["performance"]["speed_grade"] = "F"

    return result
