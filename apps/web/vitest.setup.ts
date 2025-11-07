import "@testing-library/jest-dom";

// Optional: Configure testing library to use default options
// import { configure } from "@testing-library/react";

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
	console.error = (...args: unknown[]) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Warning: ReactDOM.render")
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});

afterAll(() => {
	console.error = originalError;
});
