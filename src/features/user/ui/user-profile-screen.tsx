import React, {useEffect, useState} from "react";

import {useParams} from "react-router-dom";
import {makeStyles} from "@material-ui/core";
import User from "../types/user";
import CommonProfileInfo from "./components/common-profile-info";
import {useAppSelector} from "../../../store/hooks";

const UserProfileScreen = () => {
  const [user, setUser] = useState<User>();
  const searchResults = useAppSelector(state => state.search.results);
  const routeParams = useParams<{ id: string }>();

  useEffect(() => {
    const searchedUser = searchResults?.find(u => u.username == routeParams.id);
    setUser(searchedUser);
  });

  const classes = useStyles();

  return (
    <div className={classes.outer}>
      {!!user && <CommonProfileInfo user={user}/>}
    </div>
  );
};

const useStyles = makeStyles({
  outer: {
    width: '100%',
    height: '100%',
  },
});

export default UserProfileScreen;