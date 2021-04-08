import {Button, makeStyles} from "@material-ui/core";
import React, {useCallback} from "react";
import {useHistory} from "react-router-dom";
import {useAppSelector} from "../../../../core/redux/hooks";

const FriendsButton = () => {
    const friends = useAppSelector(state => state.friends.friends);
    const history = useHistory();
    const classes = useStyles();

    const goToFriends = useCallback(async () => {
      history.push('/friends');
    }, [history]);

    const goToFriendsInAnotherTab = useCallback(async () => {
      window.open('/friends');
    }, [history]);

    let child: React.ReactNode;
    if (!friends) {
      child = <div data-testid='no-button'/>;
    } else {
      const count = friends.length;
      const label = count
        ? count == 1
          ? '1 Friend'
          : `${count} Friends`
        : 'No friends';
      child = (
        <Button
          onClick={goToFriends}
          onAuxClick={goToFriendsInAnotherTab}
          data-testid='yes-button'>
          {label}
        </Button>
      );
    }
    return (
      <div className={classes.wrapper} data-testid='friends-button'>
        {child}
      </div>
    );
  }
;

const useStyles = makeStyles({
  wrapper: {
    minHeight: '36px',
    maxHeight: '36px',
  }
});

export default FriendsButton;