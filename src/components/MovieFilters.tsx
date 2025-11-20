import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "Horror", "Mystery", "Romance",
  "Science Fiction", "Thriller", "War", "Western"
];

interface MovieFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  activeFilters: FilterState;
}

export interface FilterState {
  genres: string[];
  yearRange: [number, number];
  ratingRange: [number, number];
  director: string;
  cast: string;
}

export const MovieFilters = ({ onFiltersChange, activeFilters }: MovieFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(activeFilters);

  const handleGenreToggle = (genre: string) => {
    const newGenres = localFilters.genres.includes(genre)
      ? localFilters.genres.filter(g => g !== genre)
      : [...localFilters.genres, genre];
    setLocalFilters({ ...localFilters, genres: newGenres });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      genres: [],
      yearRange: [1950, 2024],
      ratingRange: [0, 10],
      director: "",
      cast: ""
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = 
    localFilters.genres.length +
    (localFilters.director ? 1 : 0) +
    (localFilters.cast ? 1 : 0) +
    ((localFilters.yearRange[0] !== 1950 || localFilters.yearRange[1] !== 2024) ? 1 : 0) +
    ((localFilters.ratingRange[0] !== 0 || localFilters.ratingRange[1] !== 10) ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Movies</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Genres */}
          <div>
            <Label className="text-base mb-3 block">Genres</Label>
            <div className="grid grid-cols-2 gap-3">
              {GENRES.map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={genre}
                    checked={localFilters.genres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />
                  <label
                    htmlFor={genre}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {genre}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div>
            <Label className="text-base mb-3 block">
              Release Year: {localFilters.yearRange[0]} - {localFilters.yearRange[1]}
            </Label>
            <Slider
              value={localFilters.yearRange}
              onValueChange={(value) => setLocalFilters({ ...localFilters, yearRange: value as [number, number] })}
              min={1950}
              max={2024}
              step={1}
              className="w-full"
            />
          </div>

          {/* Rating Range */}
          <div>
            <Label className="text-base mb-3 block">
              Rating: {localFilters.ratingRange[0]} - {localFilters.ratingRange[1]}
            </Label>
            <Slider
              value={localFilters.ratingRange}
              onValueChange={(value) => setLocalFilters({ ...localFilters, ratingRange: value as [number, number] })}
              min={0}
              max={10}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Director */}
          <div>
            <Label htmlFor="director" className="text-base mb-3 block">Director</Label>
            <Input
              id="director"
              placeholder="Search by director name..."
              value={localFilters.director}
              onChange={(e) => setLocalFilters({ ...localFilters, director: e.target.value })}
            />
          </div>

          {/* Cast */}
          <div>
            <Label htmlFor="cast" className="text-base mb-3 block">Cast Member</Label>
            <Input
              id="cast"
              placeholder="Search by actor name..."
              value={localFilters.cast}
              onChange={(e) => setLocalFilters({ ...localFilters, cast: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClear} className="flex-1 gap-2">
            <X className="h-4 w-4" />
            Clear All
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};