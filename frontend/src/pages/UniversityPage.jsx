import React from "react";
import { RiArrowLeftLine } from "@remixicon/react";
import { useNavigate } from "react-router-dom";
function UniversityPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen items-center w-screen p-10 relative">
      <RiArrowLeftLine
        onClick={() => {
          navigate(-1);
        }}
        size={40}
        className="absolute left-0 top-0 mt-5 ml-5 opacity-50 hover:opacity-100"
      />
      <div className="w-[35%]">
        <img
          className="rounded-xl mb-10 w-[100%]"
          src="https://images.assettype.com/nationalherald/2023-09/d766e656-c9c5-47a5-8d37-381ae9cac123/jawaharlal_nehru_university.jpg"
          alt=""
        />
        <p className="w-full">
          JNU is like the Hogwarts of intellectuals – but instead of wands,
          students wield books, and instead of spells, they cast fiery debates!
          It’s a place where you might find someone passionately discussing
          geopolitics at the chai stall, while another is writing poetry about
          the canteen samosa. The campus is a blend of nature and nurturing,
          where peacocks roam as freely as opinions. JNU isn’t just a
          university; it’s an ecosystem of curiosity, activism, and chai-fueled
          brilliance. Sure, lectures sometimes compete with protests for
          attention, but that’s just part of the charm. JNU: where the thinking
          never stops, and the Wi-Fi occasionally does!
        </p>
      </div>
      <div className="w-full h-[80%] flex justify-center">
        <div className="border-r-2 border-black w-[50%] h-full flex flex-col items-center">
          <h3 className="text-center text-[3vw] font-[900]">
            Total Users from JNU
          </h3>
          <h4 className="text-[10vw] font-[900] mt-10">10</h4>
        </div>
        <div className="w-[50%] h-full flex flex-col items-center">
          <h3 className="text-center text-[3vw] font-[900]">
            Total Posts from JNU
          </h3>
          <h4 className="text-[10vw] font-[900] mt-10">10</h4>
        </div>
      </div>
    </div>
  );
}

export default UniversityPage;
