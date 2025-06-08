/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/
import { BIGReactWebview } from '@borkdominik-biguml/big-vscode-integration/vscode';
import {
    BatchCreateOperation,
    type BatchOperation,
    type TempCreationId,
    UpdateElementPropertyAction
} from '@borkdominik-biguml/uml-protocol';
import { CreateEdgeOperation, CreateNodeOperation } from '@eclipse-glsp/protocol';
import { inject, injectable, postConstruct } from 'inversify';
import { v4 } from 'uuid';
import {
    GenerateDiagramRequestAction,
    GenerateDiagramResponseAction,
    RequestSelectFolderAction,
    SelectedFolderResponseAction
} from '../common/code-to-class-diagram.action.js';
import type { Diagram, Edge, Node, Operation, Property } from './intermediate-model.js';

export const CodeToClassDiagramViewId = Symbol('CodeToClassDiagramViewId');

@injectable()
export class CodeToClassDiagramProvider extends BIGReactWebview {
    @inject(CodeToClassDiagramViewId)
    viewId: string;

    protected override cssPath = ['code-to-class-diagram', 'bundle.css'];
    protected override jsPath = ['code-to-class-diagram', 'bundle.js'];
    protected readonly actionCache = this.actionListener.createCache([SelectedFolderResponseAction.KIND]);

    @postConstruct()
    protected override init(): void {
        super.init();

        this.toDispose.push(this.actionCache);
    }

    protected override handleConnection(): void {
        super.handleConnection();

        this.toDispose.push(
            this.actionCache.onDidChange(message => {
                this.webviewConnector.dispatch(message);
            }),
            this.webviewConnector.onReady(() => {
                this.requestFolder();
                this.requestDiagram();
                // TODO: Example code to create a diagram
                this.createDiagram({
                    nodes: [
                        {
                            id: '1',
                            name: 'Foo',
                            type: 'Class',
                            properties: [
                                { name: 'foo', type: 'String', accessModifier: '+' },
                                { name: 'bar', type: 'int', accessModifier: '-' }
                            ],
                            operations: [
                                { name: 'test', type: 'void', accessModifier: '+', attributes: [] },
                                { name: 'asd', type: 'String', accessModifier: '#', attributes: [] }
                            ],
                            enumerationLiterals: [],
                            comment: ''
                        },
                        {
                            id: '2',
                            name: 'Bar',
                            type: 'Interface',
                            properties: [
                                { name: 'asd', type: 'String', accessModifier: '+' },
                                { name: 'gsa', type: 'int', accessModifier: '-' }
                            ],
                            operations: [
                                { name: 'te', type: 'void', accessModifier: '+', attributes: [] },
                                { name: 'qwe', type: 'String', accessModifier: '#', attributes: [] }
                            ],
                            enumerationLiterals: [],
                            comment: ''
                        }
                    ],
                    edges: [
                        {
                            fromId: '1',
                            toId: '2',
                            type: 'Association',
                            multiplicity: '1..*',
                            label: 'uses'
                        },
                        {
                            fromId: '1',
                            toId: '2',
                            type: 'Association',
                            multiplicity: '1..*',
                            label: 'should be replaced'
                        }
                    ]
                });
            }),
            this.connectionManager.onDidActiveClientChange(() => {
                console.warn('onDidActiveClientChange');
                // this.requestFolder();
                // this.requestDiagram();
            }),
            this.connectionManager.onNoActiveClient(() => {
                console.warn('onNoActiveClient');
                // Send a message to the webview when there is no active client
                this.webviewConnector.dispatch(SelectedFolderResponseAction.create());
                this.webviewConnector.dispatch(GenerateDiagramResponseAction.create());
            }),
            this.connectionManager.onNoConnection(() => {
                console.warn('onNoConnection');
                // Send a message to the webview when there is no glsp client
                this.webviewConnector.dispatch(SelectedFolderResponseAction.create());
                this.webviewConnector.dispatch(GenerateDiagramResponseAction.create());
            }),
            this.modelState.onDidChangeModelState(() => {
                console.warn('onDidChangeModelState');
                // this.requestFolder();
                // this.requestDiagram();
            })
        );
    }

    protected requestFolder(): void {
        this.actionDispatcher.dispatch(RequestSelectFolderAction.create());
    }

    protected requestDiagram(): void {
        this.actionDispatcher.dispatch(GenerateDiagramRequestAction.create());
    }

    createDiagram(diagram: Diagram): void {
        const operations: BatchOperation[] = [];

        function handleNode(node: Node, containerId?: string): BatchOperation {
            const tempId: TempCreationId = `temp_${node.id}`;

            const createOperation = CreateNodeOperation.create(`CLASS__${node.type}`, { containerId });
            const updateActions: UpdateElementPropertyAction[] = [];

            if (node.name) {
                updateActions.push(
                    UpdateElementPropertyAction.create({
                        elementId: tempId,
                        propertyId: 'name',
                        value: node.name
                    })
                );
            }

            return {
                tempCreationId: tempId,
                createOperation,
                updateActions
            };
        }

        function handleProperty(node: Node, property: Property): BatchOperation {
            const tempId: TempCreationId = `temp_${v4()}`;

            const createOperation = CreateNodeOperation.create(`CLASS__Property`, { containerId: `temp_${node.id}` });
            const updateActions: UpdateElementPropertyAction[] = [];

            if (property.name) {
                updateActions.push(
                    UpdateElementPropertyAction.create({
                        elementId: tempId,
                        propertyId: 'name',
                        value: property.name
                    })
                );
            }

            return {
                tempCreationId: tempId,
                createOperation,
                updateActions
            };
        }

        function handleOperation(node: Node, operation: Operation): BatchOperation {
            const tempId: TempCreationId = `temp_${v4()}`;

            const createOperation = CreateNodeOperation.create(`CLASS__Operation`, { containerId: `temp_${node.id}` });
            const updateActions: UpdateElementPropertyAction[] = [];

            if (operation.name) {
                updateActions.push(
                    UpdateElementPropertyAction.create({
                        elementId: tempId,
                        propertyId: 'name',
                        value: operation.name
                    })
                );
            }

            return {
                tempCreationId: tempId,
                createOperation,
                updateActions
            };
        }

        function handleEdge(edge: Edge): BatchOperation {
            const tempId: TempCreationId = `temp_${v4()}`;

            const createOperation = CreateEdgeOperation.create({
                elementTypeId: `CLASS__${edge.type}`,
                sourceElementId: `temp_${edge.fromId}`,
                targetElementId: `temp_${edge.toId}`
            });
            const updateActions: UpdateElementPropertyAction[] = [];

            if (edge.label) {
                updateActions.push(
                    UpdateElementPropertyAction.create({
                        elementId: tempId,
                        propertyId: 'name',
                        value: edge.label
                    })
                );
            }

            return {
                tempCreationId: tempId,
                createOperation,
                updateActions
            };
        }

        for (const node of diagram.nodes) {
            operations.push(handleNode(node));
            for (const property of node.properties) {
                operations.push(handleProperty(node, property));
            }
            for (const operation of node.operations) {
                operations.push(handleOperation(node, operation));
            }
        }

        for (const edge of diagram.edges) {
            operations.push(handleEdge(edge));
        }

        // For demonstration purposes, update the name of the last created node
        operations.push({
            updateActions: [
                UpdateElementPropertyAction.create({
                    elementId: operations.at(-1)!.tempCreationId!,
                    propertyId: 'name',
                    value: 'Updated Foo'
                }),
                UpdateElementPropertyAction.create({
                    elementId: operations.at(-1)!.tempCreationId!,
                    propertyId: 'name',
                    value: 'Real name :)'
                })
            ]
        });

        this.actionDispatcher.dispatch(BatchCreateOperation.create(operations));
    }
}
