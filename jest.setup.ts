import '@testing-library/jest-dom';
import dotenv from 'dotenv';
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

dotenv.config({path: './.env.test'});
TimeAgo.setDefaultLocale(en.locale);
