import {
  createStyles,
  Icon,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField
} from "@material-ui/core";
import React, {
  ChangeEvent,
  FocusEventHandler,
  useCallback,
  useState
} from "react";
import {Theme} from "@material-ui/core/styles/createMuiTheme";
import {useSearchActions} from "../../search-actions-context";
import {useAppDispatch, useAppSelector} from "../../../../core/redux/hooks";

type SearchTextFieldProps = {
  onFocus: () => void,
  onBack: () => void,
}

const SearchTextField = (props: SearchTextFieldProps) => {
  const [focused, setFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [delay, setDelay] = useState<NodeJS.Timeout>();
  const stateSQ = useAppSelector(state => state.search.searchQuery);
  const dispatch = useAppDispatch();
  const {searchForUsers} = useSearchActions();
  const classes = useStyles({focused});

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchQuery(text);
    if (text.length) {
      if (delay) clearTimeout(delay);
      const newDelay = setTimeout(
        () => dispatch(searchForUsers(text)),
        500
      );
      setDelay(newDelay);
    }
  }, [delay]);


  const onFocus: FocusEventHandler = useCallback(() => {
    props.onFocus();
    setSearchQuery(stateSQ ?? '');
    setFocused(true);
  }, [props.onFocus, stateSQ]);

  const onBack = useCallback(() => {
    props.onBack();
    setSearchQuery('');
    setFocused(false);
  }, [props.onBack]);

  return (
    <div className={classes.wrapper} data-testid='search-text-field'>
      <IconButton
        className={classes.backButton}
        onClick={onBack}
        data-testid='search-text-field-back'>
        <Icon>arrow_back</Icon>
      </IconButton>
      <TextField
        className={classes.textField}
        onFocus={onFocus}
        onChange={onChange}
        value={searchQuery}
        placeholder='Search...'
        variant='outlined'
        InputProps={{
          startAdornment: (
            <InputAdornment
              className={classes.prefix}
              position="start"
              data-testid='search-text-field-icon'>
              <Icon>search</Icon>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

type StyleProps = {
  focused: boolean
}

const useStyles = makeStyles<Theme, StyleProps>(() => {
  const transition = '200ms';
  return createStyles({
    wrapper: {
      display: 'flex',
      width: '100%',
      minHeight: '2.5rem',
      boxSizing: 'border-box',
      alignItems: 'center',
    },
    textField: props => {
      return {
        width: '100%',
        marginRight: '1.5rem',
        justifyContent: 'stretch',
        justifySelf: 'stretch',
        '& fieldset': {
          border: 'none',
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: '25px',
          background: '#F3F3F5',
        },
        '& ::placeholder': { /* Most modern browsers support this now. */
          color: 'black',
          opacity: '0.6',
        },
        '& .MuiOutlinedInput-input': {
          padding: '10px 15px',
          paddingLeft: props.focused ? '15px' : '0',
          transition,
        },
        '& .MuiOutlinedInput-adornedStart': {
          paddingLeft: props.focused ? '0' : '1rem',
          transition,
        },
      };
    },
    prefix: props => {
      const size = props.focused ? '0' : '1.6rem';
      return {
        width: size,
        height: size,
        transition,
        '& .MuiIcon-root': {
          fontSize: size,
          opacity: '0.6',
          transition,
        },
      };
    },
    backButton: props => {
      const fontSize = props.focused ? '1.6rem' : '0';
      const size = props.focused ? '2.5rem' : '0';
      const marginRight = props.focused ? '0.5rem' : '0';
      const marginLeft = props.focused ? '0.5rem' : '1.5rem';
      return {
        width: size,
        height: size,
        color: 'black',
        padding: 0,
        marginRight,
        marginLeft,
        transition,
        '& .MuiTouchRipple-root': {
          width: size,
          height: size,
        },
        '& .MuiIcon-root': {
          fontSize: fontSize,
        }
      };
    }
  });
});

export default SearchTextField;