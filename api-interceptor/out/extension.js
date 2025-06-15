"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
function activate(context) {
    const provider = new ApiTrackerProvider();
    vscode.window.registerTreeDataProvider('apiTracker', provider);
    const docsProvider = new ApiDocsTreeProvider("http://localhost:8000");
    vscode.window.registerTreeDataProvider('apiDocsTree', docsProvider);
    context.subscriptions.push(vscode.commands.registerCommand('apiDocs.openDoc', async (item) => {
        const response = await axios_1.default.get(`http://localhost:8000/api-docs/${item.docId}`);
        const doc = response.data;
        showApiDocWebview(doc, item);
    }));
    // Register commands
    const refreshCommand = vscode.commands.registerCommand('apiTracker.refresh', () => {
        provider.refresh();
    });
    const clearCommand = vscode.commands.registerCommand('apiTracker.clear', () => {
        provider.clear();
    });
    const runCurrentFileCommand = vscode.commands.registerCommand('apiTracker.runCurrentFile', () => {
        provider.runCurrentFile();
    });
    const viewDetailsCommand = vscode.commands.registerCommand('apiTracker.viewDetails', (item) => {
        provider.viewDetails(item);
    });
    // Auto-refresh on file changes
    const fileWatcher = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'python' && vscode.workspace.getConfiguration('apiTracker').get('autoRefresh')) {
            setTimeout(() => provider.refresh(), 1000);
        }
    });
    context.subscriptions.push(refreshCommand, clearCommand, runCurrentFileCommand, viewDetailsCommand, fileWatcher);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
class ApiTrackerProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    apiCalls = [];
    currentSessionId = null;
    backendUrl;
    statusBarItem;
    constructor() {
        this.backendUrl = vscode.workspace.getConfiguration('apiTracker').get('backendUrl') || 'http://localhost:8000';
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = "$(globe) API Tracker: Ready";
        this.statusBarItem.show();
        this.createSession();
    }
    async createSession() {
        try {
            const response = await axios_1.default.get(`${this.backendUrl}/api-proxy/create-session`);
            this.currentSessionId = response.data.session_id;
            this.statusBarItem.text = `$(globe) API Tracker: Session ${this.currentSessionId?.substring(0, 8)}`;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create session: ${error}`);
        }
    }
    async runCurrentFile() {
        if (!this.currentSessionId) {
            await this.createSession();
        }
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active Python file');
            return;
        }
        if (activeEditor.document.languageId !== 'python') {
            vscode.window.showWarningMessage('Current file is not a Python file');
            return;
        }
        const code = activeEditor.document.getText();
        if (!code.trim()) {
            vscode.window.showWarningMessage('No code to execute');
            return;
        }
        this.statusBarItem.text = "$(loading~spin) Running code...";
        try {
            const response = await axios_1.default.post(`${this.backendUrl}/run`, {
                code: code,
                language: 'python',
                session_id: this.currentSessionId // Pass session ID to backend
            });
            const result = response.data;
            // Show execution output
            const outputChannel = vscode.window.createOutputChannel('API Tracker - Code Output');
            outputChannel.show();
            outputChannel.appendLine('='.repeat(50));
            outputChannel.appendLine(`Execution ${result.status.toUpperCase()} - ${new Date().toLocaleString()}`);
            outputChannel.appendLine('='.repeat(50));
            outputChannel.appendLine(result.output);
            if (result.api_calls && result.api_calls.length > 0) {
                outputChannel.appendLine('\nAPI Calls Detected:');
                result.api_calls.forEach((call, index) => {
                    outputChannel.appendLine(`${index + 1}. ${call.method} ${call.url} - ${call.status}`);
                });
            }
            // Update the tree view by fetching from backend (ensures session linkage)
            await this.refresh();
            this.statusBarItem.text = `$(check) Executed - ${result.api_calls ? result.api_calls.length : 0} API calls`;
            // Show summary
            if (result.api_calls && result.api_calls.length > 0) {
                const successCount = result.api_calls.filter(call => call.status >= 200 && call.status < 300).length;
                const errorCount = result.api_calls.length - successCount;
                vscode.window.showInformationMessage(`Code executed successfully! ${result.api_calls.length} API calls detected (${successCount} successful, ${errorCount} errors)`);
            }
            else {
                vscode.window.showInformationMessage('Code executed successfully! No API calls detected.');
            }
        }
        catch (error) {
            this.statusBarItem.text = "$(error) Execution failed";
            vscode.window.showErrorMessage(`Failed to execute code: ${error}`);
        }
    }
    async refresh() {
        if (!this.currentSessionId) {
            await this.createSession();
        }
        vscode.window.showInformationMessage(`Refreshing API calls for session ${this.currentSessionId?.substring(0, 8)}`);
        try {
            const response = await axios_1.default.get(`${this.backendUrl}/api-proxy/calls/${this.currentSessionId}`);
            vscode.window.showInformationMessage(`Refreshed API calls for session ${this.currentSessionId?.substring(0, 8)}`);
            this.apiCalls = response.data || [];
            this._onDidChangeTreeData.fire();
            this.statusBarItem.text = `$(globe) API Tracker: ${this.apiCalls.length} calls`;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to refresh API calls: ${error}`);
        }
    }
    async clear() {
        if (!this.currentSessionId) {
            return;
        }
        try {
            await axios_1.default.post(`${this.backendUrl}/api-proxy/clear/${this.currentSessionId}`);
            this.apiCalls = [];
            this._onDidChangeTreeData.fire();
            this.statusBarItem.text = "$(globe) API Tracker: Cleared";
            vscode.window.showInformationMessage('API calls cleared');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to clear API calls: ${error}`);
        }
    }
    viewDetails(item) {
        const call = item.apiCall;
        const panel = vscode.window.createWebviewPanel('apiCallDetails', `API Call Details - ${call.method} ${call.url}`, vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getWebviewContent(call);
    }
    getWebviewContent(call) {
        const formattedResponse = this.formatJson(call.response);
        const formattedHeaders = this.formatJson(JSON.stringify(call.headers));
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>API Call Details</title>
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 20px;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    .header {
                        background-color: var(--vscode-editor-selectionBackground);
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                    }
                    .status {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .status.success { color: #4CAF50; }
                    .status.error { color: #F44336; }
                    .status.warning { color: #FF9800; }
                    .section {
                        margin-bottom: 20px;
                        background-color: var(--vscode-editor-selectionBackground);
                        padding: 15px;
                        border-radius: 5px;
                    }
                    .section h3 {
                        margin-top: 0;
                        color: var(--vscode-textLink-foreground);
                    }
                    pre {
                        background-color: var(--vscode-editor-background);
                        padding: 10px;
                        border-radius: 3px;
                        overflow-x: auto;
                        border: 1px solid var(--vscode-panel-border);
                    }
                    .method {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        padding: 4px 8px;
                        border-radius: 3px;
                        font-weight: bold;
                    }
                    /* JSON syntax highlight */
                    .json-key { color: #d19a66; }
                    .json-string { color: #98c379; }
                    .json-number { color: #61afef; }
                    .json-bool { color: #e06c75; }
                    .json-null { color: #c678dd; }
                    .json-value { color: #56b6c2; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="status ${this.getStatusClass(call.status)}">
                        ${call.status} ${this.getStatusText(call.status)}
                    </div>
                    <div>
                        <span class="method">${call.method}</span>
                        <strong>${call.url}</strong>
                    </div>
                    <div style="margin-top: 10px; font-size: 12px; opacity: 0.7;">
                        ${new Date(call.timestamp * 1000).toLocaleString()}
                    </div>
                </div>

                ${call.error ? `
                    <div class="section">
                        <h3>Error</h3>
                        <pre>${call.error}</pre>
                    </div>
                ` : ''}

                <div class="section">
                    <h3>Response Headers</h3>
                    <pre><code>${formattedHeaders}</code></pre>
                </div>

                <div class="section">
                    <h3>Response Body</h3>
                    <pre><code>${formattedResponse}</code></pre>
                </div>
            </body>
            </html>
        `;
    }
    formatJson(text) {
        try {
            const parsed = JSON.parse(text);
            const jsonString = JSON.stringify(parsed, null, 2);
            // Syntax highlight: wrap keys and values in spans
            return jsonString.replace(/(\s*)\"(.*?)\"(\s*):/g, (match, ws, key, ws2) => {
                return `${ws}<span class="json-key">"${key}"</span>${ws2}:`;
            }).replace(/: (\".*?\"|\d+|true|false|null)/g, (match, value) => {
                let cls = 'json-value';
                if (/^\".*\"$/.test(value))
                    cls = 'json-string';
                else if (/true|false/.test(value))
                    cls = 'json-bool';
                else if (/null/.test(value))
                    cls = 'json-null';
                else if (/\d+/.test(value))
                    cls = 'json-number';
                return `: <span class="${cls}">${value}</span>`;
            });
        }
        catch {
            return text;
        }
    }
    getStatusClass(status) {
        if (status >= 200 && status < 300)
            return 'success';
        if (status >= 400)
            return 'error';
        if (status >= 300)
            return 'warning';
        return '';
    }
    getStatusText(status) {
        const statusTexts = {
            200: 'OK',
            201: 'Created',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error'
        };
        return statusTexts[status] || 'Unknown';
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            if (this.apiCalls.length === 0) {
                return Promise.resolve([new InfoItem('No API Calls', 'Run a Python file to see API calls here.')]);
            }
            return Promise.resolve(this.apiCalls.map(call => new ApiCallItem(call)));
        }
        return Promise.resolve([]);
    }
}
class ApiDocCategoryItem extends vscode.TreeItem {
    label;
    constructor(label) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.contextValue = 'apiDocCategory';
    }
}
class ApiDocEndpointItem extends vscode.TreeItem {
    label;
    docId;
    method;
    path;
    summary;
    constructor(label, docId, method, path, summary) {
        super(`${method} ${path}`, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.docId = docId;
        this.method = method;
        this.path = path;
        this.summary = summary;
        this.description = summary;
        this.contextValue = 'apiDocEndpoint';
        this.command = {
            command: 'apiDocs.openDoc',
            title: 'Open Documentation',
            arguments: [this]
        };
    }
}
// --- CATEGORY ORGANISATION LOGIC (from dataOrganiser.tsx) ---
const PREDEFINED_CATEGORIES = [
    "repositories",
    "contents",
    "branches",
    "commits",
    "pull_requests",
    "issues"
];
function organizeEndpoints(data) {
    if (!data)
        return {};
    const categories = {};
    PREDEFINED_CATEGORIES.forEach(category => {
        categories[category] = [];
    });
    // Support both repos/user or flat endpoint arrays
    const allEndpoints = [...(data.repos || []), ...(data.user || []), ...(Array.isArray(data.endpoints) ? data.endpoints : [])];
    allEndpoints.forEach(endpoint => {
        if (PREDEFINED_CATEGORIES.includes(endpoint.category)) {
            categories[endpoint.category].push(endpoint);
        }
    });
    return categories;
}
class ApiDocsTreeProvider {
    backendUrl;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    structure = {};
    organized = {};
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
        this.refresh();
    }
    async refresh() {
        const response = await axios_1.default.get(`${this.backendUrl}/api-docs/structure`);
        if (response.status !== 200) {
            vscode.window.showErrorMessage('Failed to load API documentation structure');
            return;
        }
        this.structure = response.data;
        this.organized = organizeEndpoints(this.structure);
        this._onDidChangeTreeData.fire();
    }
    getChildren(element) {
        if (!element) {
            // Top-level: categories (always show all, even if empty)
            return Promise.resolve(PREDEFINED_CATEGORIES.map(cat => new ApiDocCategoryItem(cat)));
        }
        else if (element instanceof ApiDocCategoryItem) {
            // Endpoints in category
            const endpoints = this.organized[element.label] || [];
            return Promise.resolve(endpoints.map((ep) => new ApiDocEndpointItem(`${ep.method} ${ep.path}`, ep.id, ep.method, ep.path, ep.summary)));
        }
        return Promise.resolve([]);
    }
    getTreeItem(element) {
        return element;
    }
}
class ApiCallItem extends vscode.TreeItem {
    apiCall;
    constructor(apiCall) {
        super(`${apiCall.method} ${new URL(apiCall.url).pathname}`, vscode.TreeItemCollapsibleState.None);
        this.apiCall = apiCall;
        this.description = `${apiCall.status} ${this.getStatusText(apiCall.status)}`;
        this.tooltip = `${apiCall.method} ${apiCall.url}\nStatus: ${apiCall.status}\nTime: ${new Date(apiCall.timestamp * 1000).toLocaleString()}`;
        this.iconPath = new vscode.ThemeIcon(this.getIcon(apiCall.status));
        this.contextValue = 'apiCall';
    }
    getIcon(status) {
        if (status >= 200 && status < 300)
            return 'check';
        if (status >= 400)
            return 'error';
        if (status >= 300)
            return 'warning';
        return 'question';
    }
    getStatusText(status) {
        const statusTexts = {
            200: 'OK',
            201: 'Created',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error'
        };
        return statusTexts[status] || 'Unknown';
    }
}
class InfoItem extends ApiCallItem {
    constructor(label, description) {
        // Pass a dummy ApiCall object to the parent constructor
        super({
            id: -1,
            method: '',
            url: '',
            status: 0,
            response: '',
            headers: {},
            timestamp: Date.now() / 1000
        });
        this.label = label;
        this.description = description;
        this.iconPath = new vscode.ThemeIcon('info');
        this.tooltip = description;
        this.contextValue = 'info';
    }
}
// Helper to show API doc in a webview panel
function showApiDocWebview(doc, item) {
    const panel = vscode.window.createWebviewPanel('apiDocDetails', `API Documentation - ${item.method} ${item.path}`, vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    panel.webview.html = getApiDocWebviewContent(doc, item);
}
function getApiDocWebviewContent(doc, item) {
    // Extract backend fields
    const summary = doc.summary || '';
    const description = doc.documentation?.description || '';
    const requiredParams = doc.documentation?.required_params || [];
    const responseSchema = doc.documentation?.response_schema || {};
    const codeExamples = doc.code_examples || [];
    const operationId = doc.operation_id || '';
    const docUrl = doc.doc_url || '';
    const category = doc.category || '';
    // Build HTML
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Documentation</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            .header {
                background-color: var(--vscode-editor-selectionBackground);
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .method {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                padding: 4px 8px;
                border-radius: 3px;
                font-weight: bold;
            }
            .section {
                margin-bottom: 20px;
                background-color: var(--vscode-editor-selectionBackground);
                padding: 15px;
                border-radius: 5px;
            }
            .section h3 {
                margin-top: 0;
                color: var(--vscode-textLink-foreground);
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            th, td {
                border: 1px solid var(--vscode-panel-border);
                padding: 6px 10px;
                text-align: left;
            }
            th {
                background: var(--vscode-editor-background);
            }
            code {
                background: var(--vscode-editor-background);
                padding: 2px 4px;
                border-radius: 3px;
                font-size: 95%;
            }
            .doc-link {
                color: var(--vscode-textLink-foreground);
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div style="font-size: 1.2em; margin-bottom: 6px;">
                <span class="method">${doc.method}</span>
                <strong>${doc.path}</strong>
            </div>
            <div style="font-size: 1em; opacity: 0.8;">${summary}</div>
            ${category ? `<div style="margin-top: 8px; font-size: 0.95em; color: #888;">Category: <code>${category}</code></div>` : ''}
            ${operationId ? `<div style="margin-top: 4px; font-size: 0.95em; color: #888;">Operation ID: <code>${operationId}</code></div>` : ''}
            ${docUrl ? `<div style="margin-top: 4px; font-size: 0.95em;"><a class="doc-link" href="${docUrl}" target="_blank">External Documentation</a></div>` : ''}
        </div>
        <div class="section">
            <h3>Description</h3>
            <div>${description || '<em>No description provided.</em>'}</div>
        </div>
        ${requiredParams.length ? `
        <div class="section">
            <h3>Required Parameters</h3>
            <table>
                <tr><th>Name</th><th>Type</th><th>Description</th></tr>
                ${requiredParams.map((p) => `
                    <tr>
                        <td><code>${p.name}</code></td>
                        <td>${p.type || ''}</td>
                        <td>${p.description || ''}</td>
                    </tr>
                `).join('')}
            </table>
        </div>` : ''}
        ${Object.keys(responseSchema).length ? `
        <div class="section">
            <h3>Response Schema</h3>
            <pre>${JSON.stringify(responseSchema, null, 2)}</pre>
        </div>` : ''}
        ${codeExamples.length ? `
        <div class="section">
            <h3>Code Examples</h3>
            ${codeExamples.map((ex) => `
                <div style="margin-bottom: 10px;">
                    ${ex.language ? `<div style="font-weight:bold; margin-bottom:2px;">${ex.language}</div>` : ''}
                    <pre>${ex.code || ''}</pre>
                </div>
            `).join('')}
        </div>` : ''}
    </body>
    </html>
    `;
}
//# sourceMappingURL=extension.js.map