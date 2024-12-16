import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';

interface Artwork {
    id: number;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: string;
    date_end: string;
}

const ArtworkDataTable: React.FC<{
    page: number;
    onSelectedArtworksChange: (rows: any[]) => void;
    onPageChange: (event: any) => void;
}> = ({ page, onSelectedArtworksChange, onPageChange }) => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [rowSelectionCount, setRowSelectionCount] = useState<number>(0);
    const [selectedRowsByPage, setSelectedRowsByPage] = useState<Record<number, number[]>>({});
    const overlayPanelRef = useRef<OverlayPanel>(null);

    // Fetching data for evry page changing
    useEffect(() => {
        const fetchArtworks = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
                const data = await response.json();

                const fetchedArtworks = data.data.map((artwork: any) => ({
                    id: artwork.id,
                    title: artwork.title || 'N/A', //N/A as default value 
                    place_of_origin: artwork.place_of_origin || 'N/A',
                    artist_display: artwork.artist_display || 'N/A',
                    inscriptions: artwork.inscriptions || 'N/A',
                    date_start: artwork.date_start || 'N/A',
                    date_end: artwork.date_end || 'N/A',
                }));

                setArtworks(fetchedArtworks);
                setTotalRecords(data.pagination.total);
            } catch (error) {
                console.error('Error fetching artworks:', error); //To show errors
            } finally {
                setLoading(false);
            }
        };

        fetchArtworks();
    }, [page]);

    // For Handling row selection changes
    const handleSelectionChange = (e: { value: Artwork[] }) => {
        const selectedIds = e.value.map((row) => row.id);
        setSelectedRowsByPage((prev) => ({
            ...prev,
            [page]: selectedIds, // To track selection for current page
        }));
        onSelectedArtworksChange(e.value);
    };

    // To check if a row is selected on current page
    const isRowSelected = (rowId: number) => {
        return selectedRowsByPage[page]?.includes(rowId);
    };

    // Taking input from overlay and handling row selection
    const handleOverlaySubmit = async () => {
        let remainingRowsToSelect = rowSelectionCount;
        const updatedSelection: Record<number, number[]> = {};
        let currentPage = 1;

        try {
            while (remainingRowsToSelect > 0 && currentPage <= Math.ceil(totalRecords / 10)) {
                const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${currentPage}`);
                const data = await response.json();
                const rowsOnPage = data.data.map((artwork: any) => artwork.id);

                const rowsToSelect = rowsOnPage.slice(0, remainingRowsToSelect);
                updatedSelection[currentPage] = rowsToSelect;
                remainingRowsToSelect -= rowsToSelect.length;
                currentPage++;
            }

            setSelectedRowsByPage((prev) => ({ ...prev, ...updatedSelection }));
            overlayPanelRef.current?.hide(); // For closing overlay after submission
        } catch (error) {
            console.error('Error during bulk selection:', error);
        }
    };

    // Customizing header for title column to include the cheveron down button
    const renderTitleHeader = () => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
                icon="pi pi-chevron-down"
                onClick={(e) => overlayPanelRef.current?.toggle(e)}
                className="p-button-outlined p-button-rounded"
                style={{ marginRight: '10px' }}
            />
            <span>Title</span>
            <OverlayPanel ref={overlayPanelRef}>
                <div style={{ padding: '10px' }}>
                    <h4>Select Rows</h4>
                    <InputText
                        value={rowSelectionCount.toString()}
                        onChange={(e) => setRowSelectionCount(Number(e.target.value))}
                        style={{ width: '100%' }}
                        placeholder="Enter number of rows"
                        keyfilter="num"
                    />
                    <Button
                        label="Submit"
                        onClick={handleOverlaySubmit}
                        className="p-button-primary"
                        style={{ marginTop: '10px' }}
                    />
                </div>
            </OverlayPanel>
        </div>
    );

    return (
        <div>
            <DataTable
                value={artworks}
                loading={loading}
                paginator={false}
                tableStyle={{ minWidth: '50rem' }}
                selectionMode="checkbox"
                selection={artworks.filter((row) => isRowSelected(row.id))} // To select rows on the current page only
                onSelectionChange={handleSelectionChange}
                dataKey="id"
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                <Column field="title" header={renderTitleHeader()} style={{ width: '20%' }} />
                <Column field="place_of_origin" header="Place of Origin" style={{ width: '20%' }} />
                <Column field="artist_display" header="Artist Display" style={{ width: '20%' }} />
                <Column field="inscriptions" header="Inscriptions" style={{ width: '20%' }} />
                <Column field="date_start" header="Starting Date" style={{ width: '10%' }} />
                <Column field="date_end" header="Ending Date" style={{ width: '10%' }} />
            </DataTable>

            <Paginator
                first={(page - 1) * 10}
                rows={10}
                totalRecords={totalRecords}
                onPageChange={onPageChange}
                pageLinkSize={3}
            />
        </div>
    );
};

export default ArtworkDataTable;
