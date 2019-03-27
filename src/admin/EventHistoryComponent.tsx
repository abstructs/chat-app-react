import React from 'react';

import { Theme, TableHead, TableRow, TableCell, Table, TableBody } from '@material-ui/core';

const styles = ({ palette, spacing }: Theme) => ({

});

interface State {
}

interface Props {
    // classes: {
    // }
}

class EventHistoryComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
        }
    }

    render() {
        return (
            <div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>EventID</TableCell>
                            <TableCell>PPID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* render rows */}
                        <TableRow>
                            <TableCell align="right">Something</TableCell>
                        </TableRow>
                        {/* end */}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

export default EventHistoryComponent;