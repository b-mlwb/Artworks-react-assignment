import React, { useState } from 'react';
import ArtworkDataTable from './components/CustomerDataTable';

const App: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [_selectedArtworks, setSelectedArtworks] = useState<any[]>([]);

    // This updates the current page in state when the user navigates pages.
    const handlePageChange = (event: { page: number }) => {
        setPage(event.page + 1); // 1-based index for API
    };

    // Track selected rows from the DataTable
    const handleSelectedArtworksChange = (selectedRows: any[]) => {
        setSelectedArtworks(selectedRows); // Sync state with the selected rows
    };

    return (
        <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>Artworks React Assignment</h1>
            <ArtworkDataTable
                page={page}
                onSelectedArtworksChange={handleSelectedArtworksChange}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default App;