export class UrlStringUtils {

    static readonly Regex = /^[a-z0-9\-]+$/;

    private static readonly _ValidationRegex = new RegExp(UrlStringUtils.Regex);

    /**
     * Regex of chacacters to be removed when generating a URL string.
     * Currently only includes apostrophes.
     */
    private static readonly _SpecialCharacterRemovalRegex = new RegExp(/[\']/g);

    /**
     * Regex of chacacters to be replaced by hyphens when generating a URL string.
     */
    private static readonly _SpecialCharacterReplacementRegex = new RegExp(/[_\W+]+/g);

    /**
     * Checks of the format of the given URL string is valid.
     */
    static isValid(urlString: string) {
        if (!UrlStringUtils._ValidationRegex.test(urlString)) {
            return false;
        }
        // Regex does not catch leading and trailing hyphens.
        if (urlString.startsWith('-') || urlString.endsWith('-')) {
            return false;
        }
        return true;
    }

    /**
     * Generates a URL string from a given string.
     */
    static generate(str: string) {
        let result = str.trim()

            // Remove specific special characters first.
            .replace(UrlStringUtils._SpecialCharacterRemovalRegex, '')

            // Replace rest of special characters with hyphens.
            .replace(UrlStringUtils._SpecialCharacterReplacementRegex, '-')

            .toLowerCase();

        // Remove leading and trailing hyphens.
        if (result.startsWith('-')) {
            result = result.substr(1);
        }
        if (result.endsWith('-')) {
            result = result.substr(0, result.length - 1);
        }

        return result;
    }

}