import React, { useContext } from "react";
import { CounterContext } from "../../Context/CounterContext";
import axios from "axios";
import { UserContext } from "../../Context/UserContext";

export default function PriceRangeSlider() {
  let { maxSearch, setmaxSearch, setminSearch, minSearch } =
    useContext(CounterContext);
  let { searchkey } = useContext(UserContext);
  let { SearchResult ,setSearchResult } = useContext(UserContext);

  async function FilterbyPriceRange(mn, mx) {
    let response = await axios.get(`http://127.0.0.1:3000/api/v1/products?search=${searchkey}&minPrice=${mn}&maxPrice=${mx}`);
    console.log(response)
    setSearchResult(response)
  }

  return (
    <>
      <div id="webcrumbs">
        <div className=" flex justify-center">
          <div className="w-[400px] rounded-lg bg-white shadow-md p-6 font-sans">
            <div className="relative py-5">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute h-2 bg-primary-500 rounded-full"
                  style={{
                    left: "25%",
                    right: "25%",
                    transition: "left 0.2s ease, right 0.2s ease",
                  }}
                ></div>
              </div>

              <div
                className="absolute w-6 h-6 bg-white rounded-full shadow-md border border-primary-300 cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 hover:scale-110 transition-transform"
                style={{ left: "25%" }}
                onMouseDown={(e) => {
                  const parent = e.target.parentElement;
                  const parentRect = parent.getBoundingClientRect();
                  const handleDrag = (moveEvent) => {
                    const newPosition =
                      ((moveEvent.clientX - parentRect.left) /
                        parentRect.width) *
                      100;
                    const boundedPosition = Math.min(
                      Math.max(newPosition, 0),
                      75
                    );
                    e.target.style.left = `${boundedPosition}%`;
                    const rightHandle = document.querySelector(
                      '[data-handle="right"]'
                    );
                    const rightPos = parseFloat(rightHandle.style.left);
                    parent.querySelector(
                      ".bg-primary-500"
                    ).style.left = `${boundedPosition}%`;
                    parent.querySelector(".bg-primary-500").style.right = `${
                      100 - rightPos
                    }%`;
                    document.querySelector('[data-value="min"]').innerText =
                      Math.round(boundedPosition);

                    // Console the min and max values
                    const minValue = Math.round(boundedPosition);
                    const maxValue = parseInt(
                      document.querySelector('[data-value="max"]').innerText
                    );
                    // console.log("Min:", minValue, "Max:", maxValue);
                    setminSearch(minValue);
                    setmaxSearch(maxValue);
                    console.log(minSearch, maxSearch);
                  };
                  const handleRelease = () => {
                    document.removeEventListener("mousemove", handleDrag);
                    document.removeEventListener("mouseup", handleRelease);
                  };
                  document.addEventListener("mousemove", handleDrag);
                  document.addEventListener("mouseup", handleRelease);
                }}
              ></div>

              <div
                className="absolute w-6 h-6 bg-white rounded-full shadow-md border border-primary-300 cursor-pointer transform -translate-y-1/2 -translate-x-1/2 top-1/2 hover:scale-110 transition-transform"
                data-handle="right"
                style={{ left: "75%" }}
                onMouseDown={(e) => {
                  const parent = e.target.parentElement;
                  const parentRect = parent.getBoundingClientRect();
                  const handleDrag = (moveEvent) => {
                    const newPosition =
                      ((moveEvent.clientX - parentRect.left) /
                        parentRect.width) *
                      100;
                    const boundedPosition = Math.min(
                      Math.max(newPosition, 25),
                      100
                    );
                    e.target.style.left = `${boundedPosition}%`;
                    const leftHandle = parent.querySelector(
                      'div:not([data-handle="right"]).absolute.w-6'
                    );
                    const leftPos = parseFloat(leftHandle.style.left);
                    parent.querySelector(
                      ".bg-primary-500"
                    ).style.left = `${leftPos}%`;
                    parent.querySelector(".bg-primary-500").style.right = `${
                      100 - boundedPosition
                    }%`;
                    document.querySelector('[data-value="max"]').innerText =
                      Math.round(boundedPosition);

                    // Console the min and max values
                    const maxValue = Math.round(boundedPosition);
                    const minValue = parseInt(
                      document.querySelector('[data-value="min"]').innerText
                    );
                    console.log("Min:", minValue, "Max:", maxValue);
                  };
                  const handleRelease = () => {
                    document.removeEventListener("mousemove", handleDrag);
                    document.removeEventListener("mouseup", handleRelease);
                  };
                  document.addEventListener("mousemove", handleDrag);
                  document.addEventListener("mouseup", handleRelease);
                }}
              ></div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="text-center">
                <span className="text-[20px] text-gray-500">Min</span>
                <div className="font-medium text-lg" data-value="min">
                  25
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-500">Max</span>
                <div className="font-medium text-lg" data-value="max">
                  75
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {FilterbyPriceRange(minSearch,maxSearch)}}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
