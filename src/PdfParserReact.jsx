import React, { useState } from 'react';
import JSZip from 'jszip';
import * as mammoth from 'mammoth';
import Papa from 'papaparse';
import pdfToText from 'react-pdftotext';
import * as XLSX from 'xlsx';
import axios from 'axios';

const ResumeExtractor = () => {
    const [extractedResumes, setExtractedResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Regular expressions for fallback extraction
    const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    const NAME_REGEX = /(?:^|\n)([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})(?:\n|$)/;

    const extractWithRegex = (text) => {
        const emails = text.match(EMAIL_REGEX) || [];
        const phones = text.match(PHONE_REGEX) || [];
        const nameMatch = text.match(NAME_REGEX);
        const name = nameMatch ? nameMatch[1] : "Unknown";

        return {
            name: name,
            email: emails.length > 0 ? emails[0] : "Not found",
            phone: phones.length > 0 ? phones[0] : "Not found"
        };
    };

    const handleZipUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !file.name.toLowerCase().endsWith('.zip')) {
            setError('Please upload a ZIP file');
            return;
        }

        setIsLoading(true);
        setError(null);
        setExtractedResumes([]);

        try {
            const zip = new JSZip();
            const zipContents = await zip.loadAsync(file);

            const filePromises = [];

            zipContents.forEach((relativePath, zipEntry) => {
                if (zipEntry.dir) return;
                const promise = processResumeFile(zipEntry);
                filePromises.push(promise);
            });

            const results = await Promise.all(filePromises);
            setExtractedResumes(results.filter(Boolean));
        } catch (err) {
            console.error('Error processing zip file:', err);
            setError(`Error processing ZIP file: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const processResumeFile = async (zipEntry) => {
        const fileName = zipEntry.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();

        try {
            // Get file content as a blob
            const content = await zipEntry.async('blob');

            // Create a file object with the right type based on extension
            let mimeType = 'text/plain';
            if (fileExtension === 'pdf') mimeType = 'application/pdf';
            else if (fileExtension === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            else if (fileExtension === 'doc') mimeType = 'application/msword';
            else if (fileExtension === 'csv') mimeType = 'text/csv';
            else if (fileExtension === 'txt') mimeType = 'text/plain';

            const file = new File([content], fileName, { type: mimeType });

            // Extract text based on file type
            let fullText = '';

            if (fileExtension === 'pdf') {
                fullText = await pdfToText(file);
            } else if (fileExtension === 'docx') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                fullText = result.value;
            } else if (fileExtension === 'doc') {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    fullText = result.value;
                } catch (docError) {
                    const arrayBuffer = await file.arrayBuffer();
                    const binary = new Uint8Array(arrayBuffer);
                    let text = '';
                    for (let i = 0; i < binary.length; i++) {
                        if (binary[i] >= 32 && binary[i] <= 126) {
                            text += String.fromCharCode(binary[i]);
                        } else if (binary[i] === 13 || binary[i] === 10) {
                            text += '\n';
                        }
                    }
                    fullText = text;
                }
            } else if (fileExtension === 'csv') {
                const text = await file.text();
                const result = Papa.parse(text, { header: true });
                fullText = JSON.stringify(result.data, null, 2);
            } else if (fileExtension === 'txt') {
                fullText = await file.text();
            } else if (['xlsx', 'xls'].includes(fileExtension)) {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                fullText = JSON.stringify(jsonData, null, 2);
            } else {
                return {
                    fileName,
                    fileType: fileExtension,
                    contactInfo: {
                        name: "Unknown",
                        email: "Unsupported file format",
                        phone: "Unsupported file format"
                    }
                };
            }

            // Extract contact information
            const contactInfo = await extractWithRegex(fullText);

            return {
                fileName,
                fileType: fileExtension,
                contactInfo
            };
        } catch (err) {
            console.error(`Error processing file ${fileName}:`, err);
            return {
                fileName,
                fileType: fileExtension,
                contactInfo: {
                    name: "Error",
                    email: `Error: ${err.message}`,
                    phone: "Not found due to error"
                }
            };
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Resume Contact Information Extractor</h1>

            <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">
                    Upload ZIP File Containing Resumes
                </label>
                <input
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    className="block w-full text-sm border border-gray-300 rounded p-2"
                />
                <p className="mt-2 text-sm text-gray-500">
                    Supported resume formats: PDF, DOCX, DOC, TXT, CSV, XLS, XLSX
                </p>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Processing resumes...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {extractedResumes.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Extracted Contact Information ({extractedResumes.length} resumes)</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b text-left">File Name</th>
                                    <th className="py-2 px-4 border-b text-left">Name</th>
                                    <th className="py-2 px-4 border-b text-left">Email</th>
                                    <th className="py-2 px-4 border-b text-left">Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {extractedResumes.map((resume, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">{resume.fileName}</td>
                                        <td className="py-2 px-4 border-b">{resume.contactInfo.name}</td>
                                        <td className="py-2 px-4 border-b">{resume.contactInfo.email}</td>
                                        <td className="py-2 px-4 border-b">{resume.contactInfo.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeExtractor;