import User from "../../types/user";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import React from "react";
import {centeredLayout, wrapper} from "../../../../styles/shared";

type CommonProfileInfoProps = {
  user: User
}

const CommonProfileInfo = ({user} : CommonProfileInfoProps) => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.layout}>
        <Avatar className={classes.photo} src={user.photoURL ?? undefined}/>
        <Typography className={classes.username}>
          @{user.username}
        </Typography>
        {user.name && <Typography className={classes.name}>
          {user.name}
        </Typography>}
      </div>
    </div>
  );
};


const useStyles = makeStyles({
  wrapper: wrapper,
  layout: centeredLayout,
  photo: {
    width: '150px',
    height: '150px',
    border: '1px solid black'
  },
  username: {
    fontSize: '1rem',
    textAlign: 'center',
  },
  name: {
    fontSize: '1.3rem',
    textAlign: 'center',
  },
});

export default CommonProfileInfo;