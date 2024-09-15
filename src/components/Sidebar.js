import React from "react";
import '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ mealDetails, onClose }) => {
    console.log(mealDetails);

    return (
        <div className="fixed right-0 top-0 w-3/12 h-full bg-white shadow-lg p-4 overflow-scroll flex-col gap-5">
            <div className="w-full flex align-middle justify-between items-center text-base">
                <div className="flex-80">
                    {mealDetails.strMeal}
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
            <div className="w-full my-3">
                <img src={mealDetails.strMealThumb} alt="asd"/>
            </div>
            <div className="flex-col my-3 text-xs">
                <div className="grid grid-cols-4 gap-2 m-2">
                    <div className="text-start" style={{color: 'grey'}}>Category</div>
                    <div className="col-span-3 text-start">{mealDetails.strCategory}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 m-2">
                    <div className="text-start" style={{ color: 'grey' }}>Area</div>
                    <div className="col-span-3 text-start">{mealDetails.strArea}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 m-2">
                    <div className="text-start" style={{ color: 'grey' }}>Youtube</div>
                    <div className="col-span-3 text-start">{mealDetails.strYoutube}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 m-2">
                    <div className="text-start" style={{ color: 'grey' }}>Recipe</div>
                    <div className="col-span-3 text-start break-all">{mealDetails.strSource}</div>
                </div>
            </div>
            <div className="my-3 border border-black rounded-sm p-1">
                <div className="text-base text-start">
                    Instructions
                </div>
                <div className="details text-xs my-2 text-start">
                    {mealDetails.strInstructions}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;