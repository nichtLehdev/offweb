import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import logo from "../../public/logo.png";
import Image from "next/image";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { useRouter } from "next/router";
import DarkModeToggle from "./darkModeToggle";

const NavBar: NextPage = () => {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <>
        <Navbar fluid={true} rounded={true}>
          <Navbar.Brand href="/">
            <Image
              src={logo}
              className="mr-3 h-6 w-6 sm:h-9 sm:w-9"
              alt="Offchat Logo"
            />
            <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
              Offchat
            </span>
          </Navbar.Brand>
          <div className="flex md:order-2">
            <div className="m-auto mr-6 align-middle">
              <DarkModeToggle />
            </div>
            <Dropdown
              arrowIcon={false}
              inline={true}
              label={
                <Avatar
                  alt="User settings"
                  img={
                    session.user.image ||
                    "https://cdn-icons-png.flaticon.com/512/892/892781.png?w=1380&t=st=1669818115~exp=1669818715~hmac=4c0465a1bc19d7c352a786ce0c25f861f8fa42cf40072a22dec3f378921c03d2"
                  }
                  rounded={true}
                />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{session.user.name}</span>
                <span className="block truncate text-sm font-medium">
                  {session.user.email}
                </span>
              </Dropdown.Header>
              {/*<Dropdown.Item>Dashboard</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item>Earnings</Dropdown.Item>
                <Dropdown.Divider />*/}
              <Dropdown.Item onClick={() => signOut()}>Sign Out</Dropdown.Item>
            </Dropdown>
            <Navbar.Toggle />
          </div>
          <Navbar.Collapse>{ShowSites(session.user.access)}</Navbar.Collapse>
        </Navbar>
      </>
    );
  }

  return (
    <>
      <Navbar fluid={true} rounded={true}>
        <Navbar.Brand href="/">
          <Image
            src={logo}
            className="mr-3 h-6 w-6 sm:h-9 sm:w-9"
            alt="Offchat Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Offchat
          </span>
        </Navbar.Brand>
        <div className="flex md:order-2">
          <div className="m-auto mr-6 align-middle">
            <DarkModeToggle />
          </div>
          <Dropdown
            arrowIcon={false}
            inline={true}
            label={
              <div className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700">
                Login
              </div>
            }
          >
            <Dropdown.Item onClick={() => signIn("discord")}>
              Login with Discord
            </Dropdown.Item>
            <Dropdown.Item onClick={() => signIn("github")}>
              Login with Github
            </Dropdown.Item>
            {/*<Dropdown.Item>Dashboard</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item>Earnings</Dropdown.Item>
                <Dropdown.Divider />*/}
          </Dropdown>
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse>{PublicSites()}</Navbar.Collapse>
      </Navbar>
    </>
  );
};

const ShowSites: (hasAccess: boolean) => JSX.Element = (hasAccess) => {
  if (hasAccess) {
    return (
      <>
        {PublicSites()}
        {LockedSites()}
      </>
    );
  } else {
    return <>{PublicSites()}</>;
  }
};

const PublicSites: () => JSX.Element[] = () => {
  const router = useRouter();
  const sites = [
    {
      name: "Home",
      path: "/",
      active: false,
    },
    /*{
      name: "About",
      path: "/about",
      active: false,
    },
    {
      name: "Contact",
      path: "/contact",
      active: false,
    },*/
  ];

  const publicSites: JSX.Element[] = [];

  sites.forEach((site) => {
    if (router.pathname == site.path) {
      site.active = true;
    }
    publicSites.push(
      <Navbar.Link
        key={"nav_" + site.name}
        active={site.active}
        href={site.path}
      >
        {site.name}
      </Navbar.Link>
    );
  });

  return publicSites;
};

const LockedSites: () => JSX.Element[] = () => {
  const router = useRouter();
  const sites = [
    {
      name: "Projects",
      path: "/projects",
      active: false,
    },
    {
      name: "Members",
      path: "/members",
      active: false,
    },
    {
      name: "Twitch Tool",
      path: "/twitch",
      active: false,
    },
  ];

  const lockedSites: JSX.Element[] = [];

  sites.forEach((site) => {
    if (router.pathname.split("/")[1] == site.path.split("/")[1]) {
      site.active = true;
    }
    lockedSites.push(
      <Navbar.Link
        key={"nav_" + site.name}
        active={site.active}
        href={site.path}
      >
        {site.name}
      </Navbar.Link>
    );
  });

  return lockedSites;
};

export default NavBar;
