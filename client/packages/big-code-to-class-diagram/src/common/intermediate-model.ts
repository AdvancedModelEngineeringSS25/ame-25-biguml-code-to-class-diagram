export type Diagram = {
    edges: Edge[];
    nodes: Node[];
}


export type Edge = {
    type: 'abstraction' | 'aggregation' | 'association' | 'composition' | 'dependency' 
    | 'element-import' | 'generalization' | 'interface-realization' | 'package-import' 
    | 'package-merge' | 'realization' | 'substitution' | 'usage' 
    fromId: number;
    toId: number;
    multiplicity: string;
    label: string;
}

export type Node = {
    name: string; 
    id: number;
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