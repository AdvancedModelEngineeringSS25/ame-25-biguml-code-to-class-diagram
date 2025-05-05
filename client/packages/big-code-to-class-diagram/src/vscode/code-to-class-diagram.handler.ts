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



import { GenerateDiagramRequestAction, GenerateDiagramResponseAction, RequestSelectFolderAction, SelectedFolderResponseAction } from '../common/code-to-class-diagram.action.js';

// Handle the action within the server and not the glsp client / server
@injectable()
export class CodeToClassDiagramActionHandler implements Disposable {
    @inject(TYPES.ActionDispatcher)
    protected readonly actionDispatcher: ActionDispatcher;
    @inject(TYPES.ActionListener)
    protected readonly actionListener: ActionListener;
    @inject(EXPERIMENTAL_TYPES.GLSPServerModelState)
    protected readonly modelState: ExperimentalGLSPServerModelState;

    private readonly toDispose = new DisposableCollection();
    private path: string | null = null;

    @postConstruct()
    protected init(): void {

        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<RequestSelectFolderAction>(
                RequestSelectFolderAction.KIND,
                async () => {
                    const folders = await vscode.window.showOpenDialog({
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: 'Select Folder'
                    });
        
                    const folderPath = folders?.[0]?.fsPath ?? null;
                    console.log('Selected folder:', folderPath);
                    this.path = folderPath;
                    
                    const javaFileCount = await countJavaFiles(folderPath);
                    console.log(`Found ${javaFileCount} .java files in ${folderPath}`);
        
                    return SelectedFolderResponseAction.create({
                        folderPath: folderPath,
                        javaFileCount: javaFileCount
                    });
                }
            )

            
        );

        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<GenerateDiagramRequestAction>(
                GenerateDiagramRequestAction.KIND,
                async () => {
                    console.log("GenerateDiagramRequestAction");
                    const file = await readJavaFilesAsMap(this.path);

                
                    const test = file.get("NoMapping")
                    if(test){
                       
                    } 
 
                    console.log("READ FILE CONTENT ", file.get("NoMapping"));
                    return GenerateDiagramResponseAction.create();
                }
            )
        )

    }

    

    dispose(): void {
        this.toDispose.dispose();
    }
}

/**
 * Recursively counts all `.java` files in the given directory.
 */
async function countJavaFiles(dirPath: string | null): Promise<number> {
    let count = 0;
    if(!dirPath) return 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            count += await countJavaFiles(fullPath); // Recurse
        } else if (entry.isFile() && entry.name.endsWith('.java')) {
            count++;
        }
    }

    return count;
}

async function readJavaFilesAsMap(dirPath: string | null): Promise<Map<string, string>> {
    const fileMap = new Map<string, string>();

    async function readDirRecursive(currentPath: string | null) {
        if(!currentPath) return;
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                await readDirRecursive(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.java')) {
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    fileMap.set(entry.name.replace(/\.java$/, ''), content);
                } catch (err) {
                    console.error(`Failed to read file ${fullPath}:`, err);
                }
            }
        }
    }

    await readDirRecursive(dirPath);
    return fileMap;
}
