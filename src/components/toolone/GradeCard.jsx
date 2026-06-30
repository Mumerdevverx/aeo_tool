import React from "react";

const GradeCard = ({ grade }) => {
  // Define styles based on grade
  const getGradeStyles = (grade) => {
    switch (grade) {
      case "A":
        return {
          bg: "from-green-400 to-green-600",
          ring: "ring-green-200",
          bgOuter: "bg-green-50",
          text: "text-green-600",
        };
      case "B":
        return {
          bg: "from-blue-400 to-blue-600",
          ring: "ring-blue-200",
          bgOuter: "bg-blue-50",
          text: "text-blue-600",
        };
      case "C":
        return {
          bg: "from-yellow-400 to-yellow-600",
          ring: "ring-yellow-200",
          bgOuter: "bg-yellow-50",
          text: "text-yellow-600",
        };
      case "D":
        return {
          bg: "from-orange-400 to-orange-600",
          ring: "ring-orange-200",
          bgOuter: "bg-orange-50",
          text: "text-orange-600",
        };
      case "F":
        return {
          bg: "from-red-400 to-red-600",
          ring: "ring-red-200",
          bgOuter: "bg-red-50",
          text: "text-red-600",
        };
      default:
        return {
          bg: "from-gray-400 to-gray-600",
          ring: "ring-gray-200",
          bgOuter: "bg-gray-50",
          text: "text-gray-600",
        };
    }
  };

  const styles = getGradeStyles(grade);

  return (
    <div className="flex flex-col items-center">
      {/* Animated Circle - Continuous Zoom In/Out */}
      <div className="mx-auto mt-6">
        <div
          className={`relative flex h-40 w-40 items-center justify-center rounded-full ${styles.bgOuter} shadow-inner ring-8 ${styles.ring} animate-zoom`}
        >
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${styles.bg} text-white shadow-lg`}
          >
            <span className="text-5xl font-bold">{grade}</span>
          </div>
        </div>
      </div>

      {/* Grade label */}
      <div className="mt-4 text-center">
        <h3 className={`text-lg font-semibold mt-5 ${styles.text}`}>
          {grade === "A"
            ? "Excellent!"
            : grade === "B"
              ? "Good!"
              : grade === "C"
                ? "Average"
                : grade === "D"
                  ? "Needs Improvement"
                  : "Poor"}
        </h3>
        <p className="text-sm text-gray-500 mt-10">Performance Grade</p>
      </div>
    </div>
  );
};

export default GradeCard;
