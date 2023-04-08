import { useQuery, useReactiveVar } from "@apollo/client";
import {
  Anchor,
  AppShell,
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Menu,
  Navbar,
  ScrollArea,
  Space,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { getHotkeyHandler, useDebouncedValue } from "@mantine/hooks";
import { forwardRef, useEffect, useRef, useState } from "react";
import { AiOutlineFieldTime } from "react-icons/ai";
import {
  TbHome,
  TbMovie,
  TbPlanet,
  TbSearch,
  TbUser,
  TbUserPlus,
} from "react-icons/tb";
import {
  Form,
  Link,
  LinkProps,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { graphql } from "../../gql";
import { useSearch } from "../../hooks/useSearch";
import { loggedIn, sessionError } from "../../utils/apolloClient";
import Poster from "../poster";

interface SearchResultItemProps extends Omit<LinkProps, "to"> {
  item:
    | {
        __typename?: "Tv";
        id: string;
        tmdbId: string;
        name: string;
        posterPath: string;
      }
    | {
        __typename?: "Movie";
        id: string;
        tmdbId: string;
        title: string;
        posterPath: string;
      };
}

export const SearchResultItem = forwardRef<
  HTMLAnchorElement,
  SearchResultItemProps
>(({ item, ...props }: SearchResultItemProps, ref) => (
  <Anchor
    component={Link}
    sx={(theme) => ({
      borderRadius: theme.radius.md,
      color: "white",
      ":hover": {
        background: theme.colors.dark[6],
        textDecoration: "none",
      },
    })}
    ref={ref}
    {...props}
    to={
      item.__typename == "Movie"
        ? `/movies/${item.tmdbId}`
        : `/tv/${item.tmdbId}`
    }
    p="xs"
  >
    <Group noWrap>
      <Poster model={item} asLink={false} size="sm" />

      <Box>
        <Text>
          {item.__typename == "Movie"
            ? item.title
            : item.__typename == "Tv"
            ? item.name
            : ""}
        </Text>
      </Box>
    </Group>
  </Anchor>
));

interface SearchProfileItemProps extends Omit<LinkProps, "to"> {
  profile: { __typename?: "User"; id: string; name: string };
}

export const SearchProfileItem = forwardRef<
  HTMLAnchorElement,
  SearchProfileItemProps
>(({ profile, ...props }, ref) => {
  return (
    <Anchor
      to={"/users/" + profile.id}
      component={Link}
      sx={(theme) => ({
        borderRadius: theme.radius.md,
        color: "white",
        ":hover": {
          background: theme.colors.dark[6],
          textDecoration: "none",
        },
      })}
      p="sm"
      ref={ref}
      {...props}
    >
      <Group>
        <Avatar radius="xl">
          {profile.name
            .split(" ")
            .map((name) => name[0].toUpperCase())
            .join("")}
        </Avatar>
        <Text>{profile.name}</Text>
      </Group>
    </Anchor>
  );
});

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();

  const formRef = useRef<HTMLFormElement>(null);

  const _sessionError = useReactiveVar(sessionError);
  const _loggedIn = useReactiveVar(loggedIn);

  const { data } = useQuery(
    graphql(`
      query Me {
        me {
          id
          name
        }
      }
    `),
  );

  const [loadSearch, { data: searchData, loading }] = useSearch();

  useEffect(() => {
    if (_sessionError === "REFRESH_TOKEN_EXPIRED" || !_loggedIn) {
      navigate("/login");
    }
  }, [_sessionError, _loggedIn]);

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [debouncedSearch] = useDebouncedValue(search, 500);

  useEffect(() => {
    if (debouncedSearch) {
      (async () => {
        loadSearch({ variables: { query: debouncedSearch } }).then(() =>
          setShowSearch(true),
        );
      })();
    }
  }, [debouncedSearch, setShowSearch]);

  useEffect(() => setShowSearch(false), [location]);

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar
          width={{ base: 300 }}
          sx={(theme) => ({
            background: theme.fn.gradient({
              from: theme.colors.dark[4],
              to: theme.colors.dark[6],
              deg: 45,
            }),
            borderRight: `1px solid ${theme.colors.dark[3]}`,
          })}
        >
          <Stack align="stretch" py="sm">
            <Text
              component={Link}
              to="/"
              transform="uppercase"
              color="white"
              sx={{ alignSelf: "center", fontFamily: "Righteous" }}
              size={42}
            >
              <span>Jo</span>
              <svg
                width="32"
                height="32"
                viewBox="0 0 34 46"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22 0L16.7054 19.7579H34L15 46L18.5057 27.8324H0L22 0Z"
                  fill="url(#paint0_linear_6_10)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_6_10"
                    x1="8.5"
                    y1="17"
                    x2="17"
                    y2="46"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#A15BBC" />
                    <stop offset="1" stopColor="#1E97D7" />
                  </linearGradient>
                </defs>
              </svg>
              <span>t</span>
            </Text>
            {<Button
              component={Link}
              to="/"
              leftIcon={<TbHome size={24} />}
              variant="subtle"
              color={location.pathname === "/" ? "indigo" : "gray"}
              size="lg"
              sx={{ display: "flex", justifyContent: "stretch" }}
            >
              Home
            </Button>}
            <Button
              component={Link}
              to="/discover"
              leftIcon={<TbPlanet color="inherit" size={24} />}
              variant="subtle"
              color={location.pathname === "/discover" ? "indigo" : "gray"}
              size="lg"
              sx={{ display: "flex", justifyContent: "stretch" }}
            >
              Discover
            </Button>
            <Button
              component={Link}
              to="/recommendations"
              leftIcon={<TbUserPlus color="inherit" size={24} />}
              variant="subtle"
              color={
                location.pathname === "/recommendations" ? "indigo" : "gray"
              }
              size="lg"
              sx={{ display: "flex", justifyContent: "stretch" }}
            >
              Recommendations
            </Button>
            <Button
              component={Link}
              to="/mash-up"
              leftIcon={<TbMovie color="inherit" size={24} />}
              variant="subtle"
              color={location.pathname === "/mash-up" ? "indigo" : "gray"}
              size="lg"
              sx={{ display: "flex", justifyContent: "stretch" }}
            >
              Mash-Up
            </Button>
            <Button
              component={Link}
              to="/watchlist"
              leftIcon={<AiOutlineFieldTime color="inherit" size={24} />}
              variant="subtle"
              color={location.pathname === "/watchlist" ? "indigo" : "gray"}
              size="lg"
              sx={{ display: "flex", justifyContent: "stretch" }}
            >
              Watchlist
            </Button>
          </Stack>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          background: theme.fn.gradient({
            from: theme.colors.dark[4],
            to: theme.colors.dark[6],
            deg: -45,
          }),
        },
      })}
    >
      <Group align="center">
        <Form
          method="get"
          action="/search"
          style={{ flexGrow: 1, position: "relative" }}
          ref={formRef}
        >
          <TextInput
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
            placeholder="Search Jolt"
            radius="xl"
            size="lg"
            styles={(theme) => ({
              input: {
                border: `1px solid ${theme.colors.dark[1]}`,
                color: "white",
                "::placeholder": { color: theme.colors.gray[4] },
              },
              separatorLabel: { color: "white" },
            })}
            icon={<TbSearch color={theme.colors.gray[6]} size={16} />}
            name="query"
            onFocus={() => setShowSearch(true)}
            onBlur={(event) => {
              if (
                // the form element
                formRef.current!.contains(event.relatedTarget)
              ) {
                return;
              }
              setShowSearch(false);
            }}
            onKeyDown={getHotkeyHandler([
              ["escape", () => setShowSearch(false)],
            ])}
          />
          {showSearch && (
            <Box
              w="100%"
              sx={(theme) => ({
                position: "absolute",
                marginTop: theme.spacing.sm,
                borderRadius: theme.radius.md,
                background: theme.colors.dark[7],
                boxShadow: theme.shadows.lg,
                zIndex: 100,
              })}
              p="md"
            >
              {search !== "" ? (
                searchData?.search.tmdb.results ||
                searchData?.search.profiles ? (
                  <ScrollArea h="80vh">
                    <Stack spacing="lg">
                      {searchData?.search.profiles && (
                        <Stack>
                          <Group>
                            <Text color="white" size="sm">
                              Profiles
                            </Text>
                            <Divider color="dark.1" sx={{ flex: 1 }} />
                          </Group>
                          {searchData.search.profiles.map((profile, idx) => (
                            <Stack key={profile.id}>
                              <SearchProfileItem profile={profile} />
                              {idx !==
                                searchData.search!.profiles.length - 1 && (
                                <Divider color={theme.colors.dark[1]} />
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      )}
                      {searchData?.search.tmdb.results && (
                        <Stack>
                          <Group>
                            <Text color="white" size="sm">
                              TMDB
                            </Text>
                            <Divider color="dark.1" sx={{ flex: 1 }} />
                          </Group>
                          {searchData.search.tmdb.results.map((result, idx) => (
                            <Stack key={result.id}>
                              <SearchResultItem item={result} />
                              {idx !==
                                searchData.search!.tmdb.results.length - 1 && (
                                <Divider color={theme.colors.dark[1]} />
                              )}
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </ScrollArea>
                ) : (
                  loading && <Loader variant="dots" color="white" />
                )
              ) : (
                <Text color="white">Enter a query</Text>
              )}
            </Box>
          )}
        </Form>
        <Menu position="bottom-end">
          <Menu.Target>
            <UnstyledButton
              sx={(theme) => ({
                borderRadius: "100%",
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.black,
                "&:hover": {
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.colors.gray[0],
                },
              })}
            >
              <Avatar color="cyan" radius="xl" size="lg">
                {data?.me?.name
                  .split(" ")
                  .map((name) => name[0].toUpperCase())
                  .join("")}
              </Avatar>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown
            bg={theme.fn.rgba(theme.colors.dark[6], 0.5)}
            sx={{ backdropFilter: "blur(10px)" }}
          >
            <Menu.Item color="white" icon={<TbUser size={18} />}>
              <Text size="lg">Profile</Text>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Space h="md" />
      <Outlet />
    </AppShell>
  );
};

export default AppLayout;
