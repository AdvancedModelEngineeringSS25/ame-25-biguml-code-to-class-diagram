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
import { type Diagram, type Node as DiagramNode, type Operation, type Property } from './intermediate-model.js';


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
    private fileMap = new Map<string, Tree | null>();
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

                const javaFileCount = await this.countNumberOfJavaFiles(folderPath);
                console.log(`Found ${javaFileCount} .java files in ${folderPath}`);

                return SelectedFolderResponseAction.create({
                    folderPath: folderPath,
                    javaFileCount: javaFileCount
                });
            })
        );

        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<GenerateDiagramRequestAction>(GenerateDiagramRequestAction.KIND, async () => {
                this.fileMap = await this.readJavaFilesAsMap(this.path);
                const nodes = await Promise.all(
                    Array.from(this.fileMap.entries()).map(async ([key, value]) => {
                        return this.createClass(key, value);
                    })
                );

                // Assign after all async work is done
                this.diagram.nodes.push(...nodes);

                console.log(this.diagram);
                
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
                            this.fileMap.set(entry.name.replace(/\.java$/, ''), parsedContent);
                        }
                    } catch (err) {
                        console.error(`Failed to read file ${fullPath}:`, err);
                    }
                }
            }
        };

        await readDirRecursive(dirPath);
        return this.fileMap;
    }

    async countNumberOfJavaFiles(dirPath: string | null): Promise<number> {
        let count = 0;
        if (!dirPath) return 0;
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                count += await this.countNumberOfJavaFiles(fullPath); // Recurse
            } else if (entry.isFile() && entry.name.endsWith('.java')) {
                count++;
            }
        }

        return count;
    }

    async createClass(classname: string, tree: Tree | null): Promise<DiagramNode> {


        const c : DiagramNode = {
            name: classname,
            type: 'abstract-class',
            properties: await this.getFields(tree),
            operations: await this.getMethods(tree),
            comment: ''
        }

        return c;
    }

    async getFields(tree: Tree | null): Promise<Property[]> {
        if (!tree) return [];
        const fields: Property[] = [];

        const classNode = tree.rootNode.descendantsOfType('class_declaration')[0];
        if (!classNode) return [];

        const fieldNodes = classNode.descendantsOfType('field_declaration');

        for (const fieldNode of fieldNodes) {
            if(!fieldNode) continue;
            const modifiersNode = fieldNode.descendantsOfType('modifiers');
            const typeNode = fieldNode.childForFieldName('type');
            const varDeclarator = fieldNode.descendantsOfType('variable_declarator')[0];
            const nameNode = varDeclarator?.childForFieldName('name');

            let accessModifier: Property['accessModifier'] = '';

            if (!modifiersNode) continue
            for(const modifier of modifiersNode){
                const modifierTexts = modifier?.text
                if (modifierTexts?.includes('public')) {
                    accessModifier = '+';
                } else if (modifierTexts?.includes('private')) {
                    accessModifier = '-';
                } else if (modifierTexts?.includes('protected')) {
                    accessModifier = '#';
                }
            }

            if (nameNode && typeNode) {
                fields.push({
                    name: nameNode.text,
                    type: typeNode.text,
                    accessModifier,
                });
            }
        }

        return fields;
    }

    async getMethods(tree: Tree | null): Promise<Operation[]> {
        if(!tree) return [];
        const methods: Operation[] = [];
        const rootNode = tree.rootNode;

        const methodNodes = rootNode.descendantsOfType('method_declaration');

        for (const methodNode of methodNodes) {
            if(!methodNode) continue;

            const nameNode = methodNode.childForFieldName('name');
            const modifiersNode = methodNode.descendantsOfType('modifiers');
            const typeNode = methodNode.childForFieldName('type');
            const paramsNode = methodNode.childForFieldName('parameters');
            let accessModifier: Operation['accessModifier'] = ''; // fallback

            if (!modifiersNode) continue
            for(const modifier of modifiersNode){
                const modifierTexts = modifier?.text
                if (modifierTexts?.includes('public')) {
                    accessModifier = '+';
                } else if (modifierTexts?.includes('private')) {
                    accessModifier = '-';
                } else if (modifierTexts?.includes('protected')) {
                    accessModifier = '#';
                }
            }

            const parameters: { name: string; type: string }[] = [];

            if (paramsNode) {
                const paramNodes = paramsNode.namedChildren.filter(n => n?.type === 'formal_parameter');

                for (const param of paramNodes) {
                    if(!param) continue;
                    const typeNode = param.childForFieldName('type');
                    const nameNode = param.childForFieldName('name');
                    if (typeNode && nameNode) {
                        parameters.push({
                            type: typeNode.text,
                            name: nameNode.text,
                        });
                    }
                }
            }

            if (nameNode && typeNode) {
                methods.push({
                    name: nameNode.text,
                    accessModifier,
                    type: typeNode.text,
                    attributes: parameters
                });
            }
        }

        return methods;
    }

}

