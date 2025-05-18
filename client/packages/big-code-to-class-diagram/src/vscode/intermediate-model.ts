/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/


export type Diagram = {
    edges: Edge[];
    nodes: Node[];
}


export type Edge = {
    type: 'abstraction' | 'aggregation' | 'association' | 'composition' | 'dependency' 
    | 'element-import' | 'generalization' | 'interface-realization' | 'package-import' 
    | 'package-merge' | 'realization' | 'substitution' | 'usage' 
    fromId: string;
    toId: string;
    multiplicity: string;
    label: string;
}

export type Node = {
    id: string;
    name: string; 
    type: 'abstract-class' | 'class' | 'data-type' | 'enumeration' | 'interface' | 'primitive-type' | 'package';
    properties: Property[];
    operations: Operation[];
    comment: string;
}

export type Property = {
    name: string;
    type: string;
    accessModifier: '+' | '-' | '#' | '';
};

export type Operation = {
    name: string;
    type: string;
    accessModifier: '+' | '-' | '#' | '';
    attributes: Attribute[];
};

export type Attribute = {
    name: string;
    type: string
}