import React from "react";
import { FaArrowRight } from "react-icons/fa";

const StudentGigCard = ({ gig, onViewOffers, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition transform hover:-translate-y-1 border border-transparent hover:border-blue-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{gig.title}</h3>
          <p className="text-gray-600 mt-2 line-clamp-3">{gig.description}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-blue-600 font-semibold">{gig.domain}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-sm text-gray-500">Posted: {new Date(gig.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="ml-6 flex flex-col items-end">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-semibold text-lg">
            PKR {gig.budget}
          </div>
          <div className="mt-4 flex flex-col gap-2 w-full">
            <button
              onClick={() => onViewOffers(gig)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 justify-center"
            >
              View Offers <FaArrowRight />
            </button>

            <div className="flex gap-2 mt-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(gig)}
                  className="flex-1 bg-yellow-100 text-yellow-800 border border-yellow-200 px-3 py-2 rounded-lg hover:bg-yellow-200"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(gig._id)}
                  className="flex-1 bg-red-100 text-red-800 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-200"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGigCard;
