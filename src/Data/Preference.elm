module Data.Preference exposing (Preference(..), decode, encode, parse)

import Json.Decode as Decode
import Json.Encode as Encode


type Preference
    = Speed
    | Balance
    | Precision


encode : Preference -> Encode.Value
encode preference =
    case preference of
        Speed ->
            Encode.string "SPEED"

        Balance ->
            Encode.string "BALANCE"

        Precision ->
            Encode.string "PRECISION"


decode : Decode.Decoder Preference
decode =
    Decode.andThen
        (\str ->
            case parse str of
                Ok preference ->
                    Decode.succeed preference

                Err cause ->
                    Decode.fail cause
        )
        Decode.string


parse : String -> Result String Preference
parse str =
    case str of
        "SPEED" ->
            Ok Speed

        "BALANCE" ->
            Ok Balance

        "PRECISION" ->
            Ok Precision

        other ->
            Err (other ++ " is not a valid precision value.")
