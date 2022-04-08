import React, { useState, useEffect } from "react";
import { withAuth } from "modules/avl-components/src";
import ProjectList from "pages/Home/components/ProjectList";
import CreateButton from "pages/Home/components/CreateButton";
import CreateButtonOld from "pages/Home/components/CreateButton_old";

const Home = ({ user }) => {
  let [userData, setUserData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/projects/${user.id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("data", data);
        setUserData(data);
      });
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="h-full flex-1 flex flex-col text-gray-900 bg-white p-4">
        <div className="flex-1 flex  flex-col">
          <CreateButton user={user} />
          {/* <CreateButtonOld user={user} /> */}
          <ProjectList projects={userData} />

          {/* <div className="max-w-3xl">{JSON.stringify(user, null, 3)}</div> */}
        </div>
      </div>
    </div>
  );
};

const page = {
  name: "Projects",
  path: "/",
  exact: true,
  auth: true,
  mainNav: true,
  icon: "fal fa-home",
  sideNav: {
    color: "dark",
    size: "compact",
  },
  component: withAuth(Home),
};
export default page;
