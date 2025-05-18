/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/

import {
    EXPERIMENTAL_TYPES,
    TYPES,
    type ActionDispatcher,
    type ActionListener,
    type Disposable,
    type ExperimentalGLSPServerModelState
} from '@borkdominik-biguml/big-vscode-integration/vscode';
import { DisposableCollection } from '@eclipse-glsp/protocol';
import * as fs from 'fs/promises';
import { inject, injectable, postConstruct } from 'inversify';
import * as path from 'path';
import * as vscode from 'vscode';
import type { Tree } from 'web-tree-sitter';
import * as treeSitter from 'web-tree-sitter';

import {
    GenerateDiagramRequestAction,
    GenerateDiagramResponseAction,
    RequestSelectFolderAction,
    SelectedFolderResponseAction
} from '../common/code-to-class-diagram.action.js';
import { Diagram } from '../common/intermediate-model.js';


// Handle the action within the server and not the glsp client / server
@injectable()
export class CodeToClassDiagramActionHandler implements Disposable {
    @inject(TYPES.ActionDispatcher)
    protected readonly actionDispatcher: ActionDispatcher;
    @inject(TYPES.ActionListener)
    protected readonly actionListener: ActionListener;
    @inject(EXPERIMENTAL_TYPES.GLSPServerModelState)
    protected readonly modelState: ExperimentalGLSPServerModelState;
    @inject(TYPES.ExtensionContext)
    protected readonly extensionContext: vscode.ExtensionContext;

    private readonly toDispose = new DisposableCollection();
    private path: string | null = null;
    private parser: treeSitter.Parser | null = null;
    private diagram: Diagram = {edges: [], nodes: []}

    @postConstruct()
    protected init(): void {
        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<RequestSelectFolderAction>(RequestSelectFolderAction.KIND, async () => {
                await this.doInit();
                const folders = await vscode.window.showOpenDialog({
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Folder'
                });

                const folderPath = folders?.[0]?.fsPath ?? null;
                console.log('Selected folder:', folderPath);
                this.path = folderPath;

                const javaFileCount = await countNumberOfJavaFiles(folderPath);
                console.log(`Found ${javaFileCount} .java files in ${folderPath}`);

                return SelectedFolderResponseAction.create({
                    folderPath: folderPath,
                    javaFileCount: javaFileCount
                });
            })
        );

        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<GenerateDiagramRequestAction>(GenerateDiagramRequestAction.KIND, async () => {
                console.log('GenerateDiagramRequestAction');
                const file = await this.readJavaFilesAsMap(this.path);

                console.log('READ FILE CONTENT ', file.get('NoMapping'));
                return GenerateDiagramResponseAction.create();
            })
        );
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    protected async doInit(): Promise<void> {
        await treeSitter.Parser.init();

        // Problem arises with the following (tree-sitter)
        const javaUri = vscode.Uri.joinPath(this.extensionContext.extensionUri, 'lib', 'tree-sitter-java.wasm');
        
        const java = await treeSitter.Language.load(javaUri.fsPath);
        const parser = new treeSitter.Parser();
        parser.setLanguage(java);
        this.parser = parser;
    }

    async readJavaFilesAsMap(dirPath: string | null): Promise<Map<string, Tree | null>> {
        const fileMap = new Map<string, Tree | null>();
        this.diagram.edges = []

        const readDirRecursive = async (currentPath: string | null) => {
            if (!currentPath) return;
            const entries = await fs.readdir(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                if (entry.isDirectory()) {
                    await readDirRecursive(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.java')) {
                    try {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        const parsedContent = this.parser?.parse(content);
                        if (parsedContent) {
                            fileMap.set(entry.name.replace(/\.java$/, ''), parsedContent);
                        }
                    } catch (err) {
                        console.error(`Failed to read file ${fullPath}:`, err);
                    }
                }
            }
        };

        await readDirRecursive(dirPath);
        return fileMap;
    }
}

async function countNumberOfJavaFiles(dirPath: string | null): Promise<number> {
    let count = 0;
    if (!dirPath) return 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            count += await countNumberOfJavaFiles(fullPath); // Recurse
        } else if (entry.isFile() && entry.name.endsWith('.java')) {
            count++;
        }
    }

    return count;
}
