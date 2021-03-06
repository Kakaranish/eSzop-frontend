import React from 'react';
import { useTable } from 'react-table';
import EditableCell from './EditableCell';
import update from 'immutability-helper'
import Row from './Row';

function Table({ columns, data, updateMyData, setData, columnSettings }) {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({
        data,
        columns,
        defaultColumn: { Cell: EditableCell },
        updateMyData,
        columnSettings
    });

    const moveRow = (dragIndex, hoverIndex) => {
        const dragRecord = data[dragIndex]

        setData(
            update(data, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragRecord],
                ],
            })
        )
    }

    return (
        <>
            <table {...getTableProps()} style={{ border: '0px' }} className="table table-hover">
                <thead>
                    {
                        headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                <th style={{ border: "0px" }}></th>
                                {
                                    headerGroup.headers.map((column, columnIndex) => {
                                        if (columnIndex == headerGroup.headers.length - 1) {
                                            return <th {...column.getHeaderProps()} style={{ borderRight: '0px', borderTop: '0px' }}>
                                                {column.render('Header')}
                                            </th>
                                        }
                                        return <th {...column.getHeaderProps()} style={{ borderTop: '0px' }}>
                                            {column.render('Header')}
                                        </th>
                                    })
                                }
                                <th style={{ border: "0px" }}></th>
                            </tr>
                        ))
                    }
                </thead>

                <tbody {...getTableBodyProps()}>
                    {
                        rows.map((row, index) =>
                            prepareRow(row) ||
                            (
                                <Row index={index}
                                    row={row}
                                    rows={rows}
                                    moveRow={moveRow}
                                    setData={setData}
                                    {...row.getRowProps()}
                                />
                            )
                        )
                    }
                </tbody>
            </table>
        </>
    )
}

export default Table;