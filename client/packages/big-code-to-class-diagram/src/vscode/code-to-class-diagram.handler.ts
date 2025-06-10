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
import * as vscode from 'vscode';
import type { Tree } from 'web-tree-sitter';

import {
    ChangeLanguageResponseAction,
    GenerateDiagramRequestAction,
    GenerateDiagramResponseAction,
    RequestChangeLanguageAction,
    RequestSelectFolderAction,
    SelectedFolderResponseAction
} from '../common/code-to-class-diagram.action.js';
import {
    type Diagram,
    type Node as DiagramNode,
    type Edge,
} from './intermediate-model.js';
import { JavaUtils } from './java/JavaUtils.js';





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

    private javaUtils = new JavaUtils();

    private readonly toDispose = new DisposableCollection();
    private path: string | null = null;
    private fileMap = new Map<string, Tree>();
    private fileCount = 0;
    private diagram: Diagram = { edges: [], nodes: [] };
    language: string = "Java";

    @postConstruct()
    protected init(): void {
        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<RequestSelectFolderAction>(RequestSelectFolderAction.KIND, async () => {
                
                console.log('RequestSelectFolderAction');

                //EXT-LANGUAGE-TODO
                if(this.language === "Java"){ 
                    await this.javaUtils.doInit(this.extensionContext.extensionUri);
                }

                const folders = await vscode.window.showOpenDialog({
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: 'Select Folder'
                });

                const folderPath = folders?.[0]?.fsPath ?? null;
                console.log('Selected Folder:', folderPath);
                this.path = folderPath;
                this.fileCount = 0;

                //EXT-LANGUAGE-TODO
                if(this.language === "Java" && folderPath !== null){
                    this.fileCount = await this.javaUtils.countNumberOfJavaFiles(folderPath);
                    console.log(`Found ${this.fileCount} .java files in ${folderPath}`);
                }

                return SelectedFolderResponseAction.create({
                    folderPath: folderPath,
                    fileCount: this.fileCount
                });
            })
        );

        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<RequestChangeLanguageAction>(RequestChangeLanguageAction.KIND, async message => {
                console.log('RequestChangeLanguageAction - Selected Language:', message.action.language);
                this.fileCount = 0;
                if(message.action.language != null) this.language = message.action.language;

                //EXT-LANGUAGE-TODO
                if(this.language === "Java" && this.path !== null){
                    this.fileCount = await this.javaUtils.countNumberOfJavaFiles(this.path);
                    console.log(`Found ${this.fileCount} .java files in ${this.path}`);
                }
                return ChangeLanguageResponseAction.create({
                    fileCount: this.fileCount
                });
            })
        );

        this.toDispose.push(
            this.actionListener.handleVSCodeRequest<GenerateDiagramRequestAction>(GenerateDiagramRequestAction.KIND, async () => {
                // Create Nodes
                this.diagram = { edges: [], nodes: [] };
                this.fileMap = await this.readClassesAsMap(this.path);

                //createNodes
                const nodes = await Promise.all(
                    Array.from(this.fileMap.entries()).map(async ([key, value]) => {
                        return this.createNode(key, value);
                    })
                );

                // Assign after all async work is done
                this.diagram.nodes.push(...nodes);

                // Create Edges
                const nodeNameToIdMap = new Map<string, string>();

                for (const node of this.diagram.nodes) {
                    nodeNameToIdMap.set(node.name, node.id);
                }

                const edgesArrays = await Promise.all(
                    Array.from(this.diagram.nodes).map(node => {
                        const tree = this.fileMap.get(node.name);
                        return tree ? this.createEdges(node, tree, nodeNameToIdMap) : Promise.resolve([]);
                    })
                );

                const edges = edgesArrays.flat();
                this.diagram.edges.push(...edges);

                console.log(this.diagram);

                await fs.writeFile('diagram-node.json', JSON.stringify(this.diagram, null, 2), 'utf-8');

                return GenerateDiagramResponseAction.create();
            })
        );
    }
    
    
    async readClassesAsMap(dirPath: string | null): Promise<Map<string, Tree>>{
        //EXT-LANGUAGE-TODO
        if(this.language === "Java"){
            return await this.javaUtils.readJavaFilesAsMap(dirPath);
        }
        return new Map<string, Tree>();
    }


     async createEdges(source: DiagramNode, sourceTree: Tree, typeToId: Map<string, string>): Promise<Edge[]> {
        
        //EXT-LANGUAGE-TODO
        if(this.language === "Java"){
            return await this.javaUtils.createEdges(source,sourceTree,typeToId)
        }

        return []
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    async createNode(name: string, tree: Tree): Promise<DiagramNode> {
        let c: DiagramNode = {
            id: '',
            name: '',
            type: 'AbstractClass',
            properties: [],
            operations: [],
            enumerationLiterals: [],
            comment: ''
        };

        //EXT-LANGUAGE-TODO
        if(this.language === "Java"){
            c = await this.javaUtils.createNode(name,tree)
        }
        

        return c;
    }



    
}
