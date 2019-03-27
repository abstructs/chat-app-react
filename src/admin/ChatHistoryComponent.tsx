import React from 'react';

import { Theme, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';

const styles = ({ palette, spacing }: Theme) => ({

});

interface State {
}

interface Props {
    // classes: {
    // }
}

class ChatHistoryComponent extends React.Component<Props, State> {
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
                            <TableCell>ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Sender</TableCell>
                            <TableCell>Reciever</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell>Room</TableCell>
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

export default ChatHistoryComponent;