/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/
import { type ReactElement } from 'react';


export function CodeToClassDiagram(): ReactElement {

    const openFile = () => {
        console.log("Import File was Pressed!")
    };


    return (
        <div>
            <span>CODE TO CLASS DIAGRAM!</span>
            <button onClick={() => openFile()}>Import File</button>
        </div>
    );
}
