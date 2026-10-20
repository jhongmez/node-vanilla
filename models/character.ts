import { maxLength, minLength, object, pipe, string, type InferInput } from "valibot";

/** Validation schema for the fields required to create or update a character. */
export const CharacterSchema = object({
    name: pipe( string(), minLength(2), maxLength(10) ),
    lastName: pipe( string(), minLength(2), maxLength(20) )
});

/** A character as stored in memory, including its generated id. */
export type Character = InferInput<typeof CharacterSchema> & {
    id: number
};

/** In-memory store of characters, keyed by id. */
const characters: Map<number, Character> = new Map();

/**
 * Get all stored characters.
 *
 * @returns { Character[] } - Array of all characters.
 */
export const getAllCharacters = (): Character[] => {
    return Array.from(characters.values());
}

/**
 * Get all the information of a character
 * 
 * @param { number } id - Id of characterc
 * @returns { Character | undefined } - Information of character
 */
export const getCharacterById = ( id: number ): Character | undefined => {
    return characters.get(id);
}

/**
 * Create character with all information requeried
 * 
 * @param { Character } character - Send request with all data of character
 * @returns { Promise<Character> } - The created character.
 */
export const addCharacter = async( character: Character): Promise<Character> => {
    const newCharacter: Character = {
        ...character,
        id: Date.now()
    };
    characters.set(newCharacter.id, newCharacter);
    return newCharacter;
}

/**
 * Replaces the stored character with the given id.
 *
 * @param { number } id - The id of the character to update.
 * @param { Character } updateCharacter - The new character data.
 * @returns { Character | null } - The updated character.
 */
export const updateCharacter = (id: number, updateCharacter: Character): Character | null => {
    characterNotExist(id);

    characters.set(id, updateCharacter);
    return updateCharacter;
}

/**
 * Deletes a character by id.
 *
 * @param { number } id - The id of the character.
 * @returns { boolean } - true if the character is deleted; otherwise false.
 */
export const deleteCharacter = (id: number): boolean => {
    characterNotExist(id);
    characters.delete(id);
    return true;
}

/**
 * Checks whether a character exists, logging an error when it doesn't.
 *
 * @param { number } id - The id of the character.
 * @returns { boolean } - false if the character doesn't exist; otherwise true.
 */
export const characterNotExist = (id: number): boolean => {
    if ( !characters.has(id) ) {
        console.error(`¡Ups! Character with id ${id} not found`);
        return false;
    }
    return true
}