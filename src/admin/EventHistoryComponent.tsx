import React from 'react';

import { Theme, TableHead, TableRow, TableCell, Table, TableBody, TablePagination } from '@material-ui/core';
import { EventService, Event } from '../services/EventService';

interface State {
    events: Event[],
    page: number,
    rowsPerPage: number,
    eventsCount: number
}

const rowsPerPageOptions = [5, 10, 15];

class EventHistoryComponent extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);

        this.state = {
            events: [],
            page: 0,
            rowsPerPage: 5,
            eventsCount: 0
        }

        this.getEvents();
    }
    
    getEvents() {
        EventService.getEventHistory(this.state.page, this.state.rowsPerPage)
        .then((res: {events: Event[], eventsCount: number}) => {
            this.setState({
                events: res.events, eventsCount: res.eventsCount
            });
        });
    }

    handleChangePage(event: React.MouseEvent<HTMLButtonElement> | null, page: number) {
        this.setState({
            page
        }, this.getEvents);        
    }

    handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement>) {
        const rowsPerPage = parseInt(event.target.value);

        this.setState({
            rowsPerPage,
            page: 0
        }, this.getEvents);
    }

    render() {
        const { page, events, rowsPerPage, eventsCount } = this.state;

        return (
            <div>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>User</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>                        
                        {events.map(event => {
                            const createdAt = new Date(event.createdAt);

                            return (
                                <TableRow>
                                    <TableCell align="right">{event.type}</TableCell>
                                    <TableCell align="right">{createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell align="right">{createdAt.toLocaleTimeString()}</TableCell>
                                    <TableCell align="right">{event.username}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                <TablePagination
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={rowsPerPageOptions}
                        component="div"
                        count={eventsCount}
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

export default EventHistoryComponent;