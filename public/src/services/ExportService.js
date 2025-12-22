/**
 * ExportService - Handles document export operations
 * Supports multiple export formats with modern APIs
 */
import { EventEmitter } from '../utils/EventEmitter.js';

export class ExportService extends EventEmitter {
    constructor() {
        super();
        this.exportFormats = new Map([
            ['pdf', this.exportToPDF.bind(this)],
            ['docx', this.exportToDOCX.bind(this)],
            ['html', this.exportToHTML.bind(this)],
            ['txt', this.exportToTXT.bind(this)],
            ['markdown', this.exportToMarkdown.bind(this)]
        ]);
    }

    /**
     * Export document to specified format
     * @param {Object} document - Document object
     * @param {string} format - Export format
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportDocument(document, format, options = {}) {
        const exportFunction = this.exportFormats.get(format.toLowerCase());
        
        if (!exportFunction) {
            throw new Error(`Unsupported export format: ${format}`);
        }
        
        try {
            this.emit('exportStarted', { document, format, options });
            
            const result = await exportFunction(document, options);
            
            this.emit('exportComplete', { document, format, result, options });
            
            return {
                format,
                filename: this.generateFilename(document.name, format),
                content: result.content,
                blob: result.blob,
                size: result.size || result.content?.length || 0,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.emit('exportError', { document, format, error });
            throw error;
        }
    }

    /**
     * Get available export formats
     * @returns {Array} Array of format information
     */
    getSupportedFormats() {
        return Array.from(this.exportFormats.keys()).map(format => ({
            format,
            name: format.toUpperCase(),
            description: this.getFormatDescription(format),
            mimeType: this.getMimeType(format),
            extension: this.getFileExtension(format)
        }));
    }

    /**
     * Check if format is supported
     * @param {string} format - Format to check
     * @returns {boolean} Support status
     */
    isFormatSupported(format) {
        return this.exportFormats.has(format.toLowerCase());
    }

    /**
     * Export to PDF using modern library
     * @param {Object} document - Document object
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToPDF(document, options = {}) {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('jsPDF library not loaded');
        }
        
        const pdfDoc = new jsPDF('p', 'mm', 'a4');
        const content = this.processContentForPDF(document.content);
        
        // Add content to PDF
        const pageWidth = pdfDoc.internal.pageSize.getWidth();
        const pageHeight = pdfDoc.internal.pageSize.getHeight();
        const margin = 20;
        const y = margin;
        let currentPageY = margin;
        
        content.split('\\n').forEach(line => {
            if (currentPageY > pageHeight - margin) {
                pdfDoc.addPage();
                currentPageY = margin;
            }
            
            // Process inline formatting
            const processedLine = this.processPDFLine(line);
            
            pdfDoc.text(processedLine, margin, currentPageY);
            currentPageY += 7; // Line height
        });
        
        const blob = pdfDoc.output('blob');
        
        return {
            content: blob,
            blob,
            size: blob.size
        };
    }

    /**
     * Export to DOCX using modern library
     * @param {Object} document - Document object
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToDOCX(document, options = {}) {
        // For now, export as HTML with DOCX-compatible structure
        // In production, use docx.js library
        const docxContent = this.convertToDOCXFormat(document.content);
        
        const blob = new Blob([docxContent], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        
        return {
            content: docxContent,
            blob,
            size: blob.size
        };
    }

    /**
     * Export to HTML
     * @param {Object} document - Document object
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToHTML(document, options = {}) {
        const htmlContent = this.processHTMLContent(document.content, options);
        
        const blob = new Blob([htmlContent], {
            type: 'text/html'
        });
        
        return {
            content: htmlContent,
            blob,
            size: blob.size
        };
    }

    /**
     * Export to plain text
     * @param {Object} document - Document object
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToTXT(document, options = {}) {
        const textContent = this.extractTextFromHTML(document.content);
        
        const blob = new Blob([textContent], {
            type: 'text/plain'
        });
        
        return {
            content: textContent,
            blob,
            size: blob.size
        };
    }

    /**
     * Export to Markdown
     * @param {Object} document - Document object
     * @param {Object} options - Export options
     * @returns {Promise<Object>} Export result
     */
    async exportToMarkdown(document, options = {}) {
        const htmlContent = document.content;
        const markdownContent = this.convertHTMLToMarkdown(htmlContent);
        
        const blob = new Blob([markdownContent], {
            type: 'text/markdown'
        });
        
        return {
            content: markdownContent,
            blob,
            size: blob.size
        };
    }

    /**
     * Process content for PDF export
     * @param {string} content - HTML content
     * @returns {Array} Processed lines
     */
    processContentForPDF(content) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        return temp.innerText || temp.textContent || '';
    }

    /**
     * Convert HTML to DOCX format
     * @param {string} html - HTML content
     * @returns {string} DOCX content
     */
    convertToDOCXFormat(html) {
        // Basic DOCX structure - in production, use proper library
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<word:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>${this.escapeXML(html)}</w:t>
            </w:r>
        </w:p>
    </w:body>
</word:document>`;
    }

    /**
     * Process HTML content for export
     * @param {string} content - HTML content
     * @param {Object} options - Export options
     * @returns {string} Processed HTML
     */
    processHTMLContent(content, options = {}) {
        if (options.includeStyles !== false) {
            return content; // Return as-is for now
        }
        
        // Add CSS styles
        const styles = `
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                h1 { font-size: 24px; font-weight: bold; margin: 20px 0 10px 0; }
                h2 { font-size: 20px; font-weight: bold; margin: 15px 0 8px 0; }
                h3 { font-size: 16px; font-weight: bold; margin: 10px 0 6px 0; }
                p { margin: 10px 0; }
                ul, ol { margin: 10px 0; padding-left: 20px; }
                li { margin: 5px 0; }
                table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
            </style>
        `;
        
        const cleanContent = this.cleanHTML(content);
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    ${styles}
</head>
<body>
    ${cleanContent}
</body>
</html>`;
    }

    /**
     * Convert HTML to Markdown
     * @param {string} html - HTML content
     * @returns {string} Markdown content
     */
    convertHTMLToMarkdown(html) {
        // Basic HTML to Markdown conversion
        let markdown = html;
        
        // Headers
        markdown = markdown.replace(/<h1[^>]*>(.*?)<\\/h1>/gi, '# $1\\n\\n');
        markdown = markdown.replace(/<h2[^>]*>(.*?)<\\/h2>/gi, '## $1\\n\\n');
        markdown = markdown.replace(/<h3[^>]*>(.*?)<\\/h3>/gi, '### $1\\n\\n');
        
        // Bold
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<b[^>]*>(.*?)<\\/b>/gi, '**$1**');
        
        // Italic
        markdown = markdown.replace(/<em[^>]*>(.*?)<\\/em>/gi, '*$1*');
        markdown = markdown.replace(/<i[^>]*>(.*?)<\\/i>/gi, '*$1*');
        
        // Links
        markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\\/a>/gi, '[$1]($2)');
        
        // Lists
        markdown = markdown.replace(/<ul[^>]*>/gi, '');
        markdown = markdown.replace(/<\\/ul>/gi, '');
        markdown = markdown.replace(/<ol[^>]*>/gi, '');
        markdown = markdown.replace(/<\\/ol>/gi, '');
        markdown = markdown.replace(/<li[^>]*>(.*?)<\\/li>/gi, '- $1');
        
        // Line breaks
        markdown = markdown.replace(/<br[^>]*>/gi, '\\n');
        markdown = markdown.replace(/<\\/p>/gi, '\\n\\n');
        markdown = markdown.replace(/<p[^>]*>/gi, '');
        
        // Clean up remaining HTML
        markdown = markdown.replace(/<[^>]*>/g, '');
        
        return markdown.trim();
    }

    /**
     * Extract plain text from HTML
     * @param {string} html - HTML content
     * @returns {string} Plain text
     */
    extractTextFromHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    /**
     * Clean HTML content
     * @param {string} html - HTML content
     * @returns {string} Cleaned HTML
     */
    cleanHTML(html) {
        // Remove script tags and content
        let clean = html.replace(/<script[^>]*>.*?<\\/script>/gi, '');
        
        // Remove style tags
        clean = clean.replace(/<style[^>]*>.*?<\\/style>/gi, '');
        
        // Remove comments
        clean = clean.replace(/<!--.*?-->/gi, '');
        
        return clean;
    }

    /**
     * Process PDF line with formatting
     * @param {string} line - Text line
     * @returns {string} Processed line
     */
    processPDFLine(line) {
        return line.replace(/<b[^>]*>(.*?)<\\/b>/gi, '$1')
                 .replace(/<strong[^>]*>(.*?)<\\/strong>/gi, '$1');
    }

    /**
     * Escape XML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeXML(text) {
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;')
                   .replace(/'/g, '&#39;');
    }

    /**
     * Generate filename for export
     * @param {string} documentName - Document name
     * @param {string} format - Export format
     * @returns {string} Generated filename
     */
    generateFilename(documentName, format) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const cleanName = documentName.replace(/[^a-zA-Z0-9\\s-]/g, '');
        
        return `${cleanName}_${timestamp}.${this.getFileExtension(format)}`;
    }

    /**
     * Get MIME type for format
     * @param {string} format - Export format
     * @returns {string} MIME type
     */
    getMimeType(format) {
        const mimeTypes = {
            pdf: 'application/pdf',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            html: 'text/html',
            txt: 'text/plain',
            markdown: 'text/markdown'
        };
        
        return mimeTypes[format] || 'application/octet-stream';
    }

    /**
     * Get file extension for format
     * @param {string} format - Export format
     * @returns {string} File extension
     */
    getFileExtension(format) {
        const extensions = {
            pdf: 'pdf',
            docx: 'docx',
            html: 'html',
            txt: 'txt',
            markdown: 'md'
        };
        
        return extensions[format] || 'txt';
    }

    /**
     * Get format description
     * @param {string} format - Export format
     * @returns {string} Format description
     */
    getFormatDescription(format) {
        const descriptions = {
            pdf: 'PDF Document',
            docx: 'Microsoft Word Document',
            html: 'HTML Web Page',
            txt: 'Plain Text Document',
            markdown: 'Markdown Document'
        };
        
        return descriptions[format] || 'Unknown Format';
    }

    /**
     * Download file automatically
     * @param {Object} exportResult - Export result
     */
    downloadFile(exportResult) {
        const { FileSaver } = window;
        
        if (FileSaver) {
            FileSaver.saveAs(exportResult.blob, exportResult.filename);
        } else {
            // Fallback download method
            const link = document.createElement('a');
            link.href = URL.createObjectURL(exportResult.blob);
            link.download = exportResult.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }
        
        this.emit('fileDownloaded', exportResult);
    }
}