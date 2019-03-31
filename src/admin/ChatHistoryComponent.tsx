import React from 'react';

import { Theme, Table, TableHead, TableRow, TableCell, TableBody, TablePagination } from '@material-ui/core';
import { EventService, ChatEvent } from '../services/EventService';

const styles = ({ palette, spacing }: Theme) => ({

});

interface State {
    page: number,
    rowsPerPage: number,
    chatEventsCount: number,
    chatEvents: ChatEvent[]
}

interface Props {
}

const rowsPerPageOptions = [5, 10, 15];

class ChatHistoryComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 5,
            chatEventsCount: 0,
            chatEvents: []
        }

        this.getChatEvents()
    }

    getChatEvents() {
        EventService.getChatEventHistory(this.state.page, this.state.rowsPerPage)
            .then((res: {chatEvents: ChatEvent[], eventsCount: number}) => {
                this.setState({
                    chatEventsCount: res.eventsCount,
                    chatEvents: res.chatEvents
                });
            });
    }

    handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
        this.setState({
            page
        }, this.getChatEvents);        
    }

    handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        const rowsPerPage = parseInt(event.target.value);

        this.setState({
            rowsPerPage,
            page: 0
        }, this.getChatEvents);
    }

    render() {

        const { chatEvents, rowsPerPage, page, chatEventsCount } = this.state;

        return (
            <div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Sender</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell>Room</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chatEvents.map(chatEvent => {
                                const createdAt = new Date(chatEvent.createdAt);

                                return (
                                    <TableRow>
                                        <TableCell align="right">{createdAt.toLocaleDateString()}</TableCell>
                                        <TableCell align="right">{createdAt.toLocaleTimeString()}</TableCell>
                                        <TableCell align="right">{chatEvent.username}</TableCell>
                                        <TableCell align="right">{chatEvent.message}</TableCell>
                                        <TableCell align="right">{chatEvent.roomName}</TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
                <TablePagination
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={rowsPerPageOptions}
                        component="div"
                        count={chatEventsCount}
                        page={page}
                        SelectProps={{
                            native: true
                        }}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page'
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page'
                        }}
                        onChangePage={this.handleChangePage.bind(this)}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage.bind(this)}
                    />
            </div>
        );
    }
}

export default ChatHistoryComponent;