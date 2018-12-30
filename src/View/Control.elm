module View.Control exposing (view)

import Data.LatLng as LatLng exposing (LatLng)
import Data.Preference as Preference exposing (Preference(..))
import Data.Progress as Progress exposing (Progress)
import Data.Request as Request exposing (Request)
import Data.TravelMode as TravelMode exposing (TravelMode(..))
import Html exposing (Html, button, div, h1, input, label, option, p, section, select, span, text)
import Html.Attributes exposing (attribute, checked, class, id, selected, style, type_, value)
import Html.Events exposing (onClick, onInput)


view : ((Request -> Request) -> a) -> a -> Request -> Html a
view requestChanged noOp request =
    div
        [ style "display" "flex"
        , style "flex-direction" "column"
        ]
        [ label []
            [ span [] [ text "Origin" ]
            , select []
                [ option [] [ text "Current location" ]
                , option [] [ text "Specify on the Map" ]
                ]
            ]
        , label []
            [ span [] [ text "Time(min)" ]
            , input
                [ type_ "number"
                , onInput
                    (String.toInt
                        >> Maybe.map (\time -> requestChanged (\req -> { req | time = time * 60 }))
                        >> Maybe.withDefault noOp
                    )
                , value (String.fromInt (request.time // 60))
                ]
                []
            ]
        , label []
            [ span [] [ text "Method" ]
            , select
                [ onInput
                    (TravelMode.parse
                        >> Result.map (\mode -> requestChanged (\req -> { req | travelMode = mode }))
                        >> Result.withDefault noOp
                    )
                ]
                [ option [ value "WALKING", selected (request.travelMode == Walking) ] [ text "Walking" ]
                , option [ value "DRIVING", selected (request.travelMode == Driving) ] [ text "Driving" ]
                ]
            ]
        , label []
            [ span [] [ text "Preference" ]
            , select
                [ onInput
                    (Preference.parse
                        >> Result.map (\value -> requestChanged (\req -> { req | preference = value }))
                        >> Result.withDefault noOp
                    )
                ]
                [ option [ value "SPEED", selected (request.preference == Speed) ] [ text "Speed" ]
                , option [ value "BALANCE", selected (request.preference == Balance) ] [ text "Balance" ]
                , option [ value "PRECISION", selected (request.preference == Precision) ] [ text "Precision" ]
                ]
            ]
        , label []
            [ input
                [ type_ "checkbox"
                , onInput (\_ -> requestChanged (\req -> { req | avoidFerries = not req.avoidFerries }))
                , checked request.avoidFerries
                ]
                []
            , span [] [ text "Avoid Ferries" ]
            ]
        , label []
            [ input
                [ type_ "checkbox"
                , onInput (\_ -> requestChanged (\req -> { req | avoidHighways = not req.avoidHighways }))
                , checked request.avoidHighways
                ]
                []
            , span [] [ text "Avoid Highways" ]
            ]
        , label []
            [ input
                [ type_ "checkbox"
                , onInput (\_ -> requestChanged (\req -> { req | avoidTolls = not req.avoidTolls }))
                , checked request.avoidTolls
                ]
                []
            , span [] [ text "Avoid Tolls" ]
            ]
        ]
