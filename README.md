# Google Sheets Transaction CSV Uploader

A Google Apps Script project that allows users to upload multiple bank and payment
CSV statements through a custom HTML interface and automatically normalize,
categorize, and sort transactions into a Google Sheet.

## Features
- Custom HTML/CSS/JS modal UI inside Google Sheets
- Drag-and-drop CSV uploads
- Supports multiple financial providers:
  - Capital One Venture X
  - Capital One Savor One
  - Chase Amazon
  - Venmo
- Client-side file parsing with async upload
- Server-side Apps Script processing
- Automatic sorting and table aggregation
- Progress bar with smooth animation feedback

## Tech Stack
- Google Apps Script (V8)
- HTML / CSS / Vanilla JavaScript
- Google Sheets API
- CSV parsing & data normalization

## Why this exists
This tool replaces manual copy-paste workflows and reduces transaction imports
from minutes to seconds while maintaining consistent formatting across providers.

## Screenshots