// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// eslint-disable-next-line no-global-assign, no-undef
global.TextEncoder = TextEncoder;
// eslint-disable-next-line no-global-assign, no-undef
global.TextDecoder = TextDecoder;
