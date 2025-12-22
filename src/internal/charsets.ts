const lowercase = "abcdefghijklmnopqrstuvwxyz";
const uppercase = lowercase.toUpperCase();
const numbers = "0123456789";

export const charsets = {
	lowercase,
	uppercase,
	numbers,
	hexadecimalUppercase: numbers + "ABCDEF",
	hexadecimalLowercase: numbers + "abcdef",
	alphanumericUppercase: uppercase + numbers,
	alphanumericLowercase: lowercase + numbers,
	alphanumericMixedCase: lowercase + uppercase + numbers,
	urlSafe: uppercase + lowercase + numbers + "_-.~",
	wide: uppercase + lowercase + numbers + "_-+=[]{};#:@~,./<>?!$%^&*()",
	exclude: (charset: string, excluded: string) => {
		const excludedSet = new Set([...excluded]);
		return [...charset].filter(c => !excludedSet.has(c)).join("");
	},
	unique: (charset: string) => {
		return [...new Set([...charset])].join("");
	},
}
