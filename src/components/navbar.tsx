import { NextPage } from "next";
import { useSession } from "next-auth/react";
import React from "react";
import logo from "../../public/logo.png";
import Image from "next/image";

const NavBar: NextPage = () => {
  const { data: session, status } = useSession();

  if (session) {
    if (session.user!.access == true) {
      return <></>;
    }
  }

  return (
    <>
      <div></div>
    </>
  );
};

export default NavBar;
