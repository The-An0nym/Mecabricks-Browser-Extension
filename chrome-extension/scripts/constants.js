/**
 * GLOBAL CONSTANTS
 * @contant {String[]} pathname is a list of all folders or file names after *BASEURL/LANG/*
 */
const pathname =
  window.location.pathname[3] === "/"
    ? window.location.pathname.split("/").slice(2)
    : window.location.pathname.split("/").slice(1);

/**
 * GLOBAL CONSTANT
 * @constant {String} fullURL full URL
 */
const fullUrl = window.location.href;

/**
 * GLOBAL CONSTANT
 * @constant {String} lang language (2 letters)
 */
const lang =
  window.location.pathname[3] === "/"
    ? window.location.pathname.slice(1, 3)
    : "en";

/**
 * GLOBAL CONSTANT
 * @constant browser browser context of user
 */
const browser = window.browser ? window.browser : window.chrome;
