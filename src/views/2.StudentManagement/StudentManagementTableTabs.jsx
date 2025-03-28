import React, { useMemo, useCallback } from 'react'

const StudentManagementTableTabs = ({ selectedCategory, setSelectedCategory, students = [] }) => {
    const categories = useMemo(() => 
      ["All Students", ...new Set(students.map(student => student.programLevel))].filter(Boolean),
      [students]
    );

    const getCategoryCount = useCallback((category) => {
        if (!students) return 0;
        if (category === "All Students") return students.length;
        return students.filter(student => student.programLevel === category).length;
    }, [students]);

    const handleCategoryClick = useCallback((category) => {
        setSelectedCategory(category);
    }, [setSelectedCategory]);

    return (
        <div className="relative border-b">
            <div className="flex space-x-6 px-3">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`relative px-3 py-2 text-sm font-[Inter-Medium] transition-colors duration-300 capitalize ${
                            selectedCategory === category
                                ? "text-[#23388F] font-[Inter-Medium] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#23388F]"
                                : "text-gray-600 hover:text-gray-900 hover:after:absolute hover:after:left-0 hover:after:bottom-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-gray-400"
                        }`}
                    >
                        {category} ({getCategoryCount(category)})
                    </button>
                ))}
            </div>
        </div>
    )
}

export default React.memo(StudentManagementTableTabs)