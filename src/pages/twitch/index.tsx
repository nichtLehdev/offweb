import { NextPage } from "next";
import React from "react";
import NavBar from "../../components/navbar";
import { trpc } from "../../utils/trpc";

const TwitchPage: NextPage = () => {
  //const channels = trpc.auth.getAllChannels.useQuery();
  //console.log(channels);
  return (
    <div>
      <NavBar></NavBar>
      <h1>Twitch - Test</h1>
    </div>
  );
};

export default TwitchPage;
