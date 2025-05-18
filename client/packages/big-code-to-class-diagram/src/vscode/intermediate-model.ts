type Diagram = {
    edges: Edge[];
    nodes: Node[];
}

type Edge = {
    type: 'abstraction' | 'aggregation' // TODO add more
    from: Node;
    to: Node;
    multiplicity: string;
    label: string;
}

type Node = {
    name: string; //unique or id?
    type: 'abstract-class' | 'class' | 'data-type' | 'enumeration' | 'interface' | 'primitive-type' | 'package';
    properties: Property[];
    operations: Operation[];
    comment: string;
}

type Property = {
    name: string;
    type: string;
    accessModifier: '+' | '-' | '#' | '';
};

type Operation = {
    name: string;
    type: string;
    accessModifier: '+' | '-' | '#' | '';
    attributes: Attribute[];
};

type Attribute = {
    name: string;
    type: string
}