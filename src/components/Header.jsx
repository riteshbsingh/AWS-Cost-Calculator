import React from "react";
import { Calculator, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-between items-center w-full pb-8 bg-white">
      <style>
        {`
          .bg-purple-600 { background-color: #6d28d9; }
          .hover\\:bg-purple-700:hover { background-color: #5b21b6; }
          .text-orange-500 { color: #f59e0b; }
          .text-gray-800 { color: #1f2937; }
          .bg-white { background-color: #ffffff; }
          .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        `}
      </style>
      <div className="flex flex-row justify-center items-center gap-4 text-center">
        <Calculator className="text-orange-500" size={48} />
        <h1 className="text-3xl font-bold text-gray-800">
          IIoT Cost Calculator
        </h1>
      </div>
      <div>
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <List size={20} />
          View Saved Reports
        </button>
      </div>
    </div>
  );
};

export default Header;