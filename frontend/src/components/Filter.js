import React, { useState } from "react";
import {
    Button,
    TextField,
    Box,
    Popover,
    Typography,
} from "@mui/material";

const Filter = ({ columns, onFilter }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [filters, setFilters] = useState({});

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        onFilter(filters);
        setAnchorEl(null);
    };

    return (
        <>
            <Button
                variant="contained"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                startIcon={<span>🔍</span>}
            >
                Filter
            </Button>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Box sx={{ p: 3, width: 300 }}>
                    <Typography variant="h6" mb={2}>
                        Filter Timetables
                    </Typography>
                    <form onSubmit={handleFilterSubmit}>
                        {columns.map((column) => (
                            <TextField
                                key={column}
                                label={column}
                                name={column}
                                value={filters[column] || ""}
                                onChange={handleFilterChange}
                                fullWidth
                                margin="normal"
                                size="small"
                            />
                        ))}
                        <Box display="flex" justifyContent="end" gap={1} mt={2}>
                            <Button size="small" onClick={() => setAnchorEl(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" size="small">
                                Apply
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Popover>
        </>
    );
};

export default Filter;