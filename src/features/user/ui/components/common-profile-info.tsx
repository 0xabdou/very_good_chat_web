import User from "../../types/user";
import {Avatar, makeStyles, Typography} from "@material-ui/core";
import React from "react";

type CommonProfileInfoProps = {
  user: User
}

const CommonProfileInfo = ({user}: CommonProfileInfoProps) => {
  const classes = useStyles();

  return (
    <div className={classes.layout} data-testid='common-profile-info'>
      <Avatar className={classes.photo} src={user.photo?.medium}/>
      <Typography className={classes.username}>
        @{user.username}
      </Typography>
      {user.name && <Typography className={classes.name}>
        {user.name}
      </Typography>}
    </div>
  );
};


const useStyles = makeStyles({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    fontSize: '0.8rem',
    textAlign: 'center',
  },
});

export default CommonProfileInfo;