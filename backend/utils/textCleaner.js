/**
 * Extracts raw textual data from PDFs to conserve tokens for OpenRouter
 */
const cleanResumeText = (rawText) => {
    if (!rawText || typeof rawText !== 'string') return '';
    
    // 1. Remove excessive whitespace, replace multiple spaces/newlines with single space
    let cleaned = rawText.replace(/\s+/g, ' ');
    
    // 2. Remove non-ASCII characters and weird PDF binary artifacts
    cleaned = cleaned.replace(/[^\x20-\x7E]/g, '');
    
    // 3. Optional: remove common massive stop words if aggressive compression is needed
    // (We will keep it simple here to ensure we don't accidentally remove skills like 'C' or 'R')
    
    // 4. Remove URLs as they usually do not signify a technical skill and cost tokens
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
    
    // 5. Trim leading/trailing spaces
    return cleaned.trim();
};

module.exports = { cleanResumeText };
