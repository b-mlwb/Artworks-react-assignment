import React, { useState } from 'react';
import ArtworkDataTable from './components/CustomerDataTable';

const App: React.FC = () => {
    const [page, setPage] = useState<number>(1);
    const [_selectedArtworks, setSelectedArtworks] = useState<any[]>([]);

    const handlePageChange = (event: { page: number }) => {
        setPage(event.page + 1);
    };

    //For tracking selected rows from the datatable
    const handleSelectedArtworksChange = (selectedRows: any[]) => {
        setSelectedArtworks(selectedRows); 
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
