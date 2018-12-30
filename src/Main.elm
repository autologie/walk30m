port module Main exposing (main)

import Browser
import Data.Progress as Progress exposing (Progress)
import Data.Request as Request exposing (Preference(..), Request, TravelMode(..))
import Data.Session as Session exposing (Session(..))
import Html exposing (button, div, h1, p, section, text)
import Html.Attributes exposing (attribute, class, id, style)
import Html.Events exposing (onClick)
import Http exposing (Error)
import Json.Decode as Decode
import Json.Encode as Encode


port renderGoogleSignInButton : () -> Cmd msg


port renderGoogleMaps : () -> Cmd msg


port execute : Encode.Value -> Cmd msg


port signOut : () -> Cmd msg


port receiveIdToken : (String -> msg) -> Sub msg


port signedOut : (() -> msg) -> Sub msg


port executionProgress : (Encode.Value -> msg) -> Sub msg


type Msg
    = ReceiveIdToken String
    | ReceiveSessionCreateResponse (Result Error Session)
    | SignOut
    | SignedOut ()
    | ExecutionProgress (Result Decode.Error Progress)
    | CreateExecution
    | CloseModal
    | Execute


type ModalContent
    = SignInRequired


type alias Model =
    { session : Maybe Session
    , modalContent : Maybe ModalContent
    , request : Request
    }


initialModel =
    { session = Nothing
    , modalContent = Nothing
    , request =
        { travelMode = Driving
        , time = 30 * 60
        , origin = { lat = 35.5, lng = 140 }
        , preference = Balance
        , smoothGeometry = True
        , dissolveGeometry = True
        }
    }


main : Program () Model Msg
main =
    Browser.element
        { init =
            \() ->
                ( initialModel
                , Cmd.batch [ renderGoogleMaps () ]
                )
        , subscriptions =
            \_ ->
                Sub.batch
                    [ receiveIdToken ReceiveIdToken
                    , signedOut SignedOut
                    , executionProgress (Decode.decodeValue Progress.decode >> ExecutionProgress)
                    ]
        , update =
            \msg model ->
                case msg of
                    ReceiveIdToken token ->
                        ( model
                        , Session.create token ReceiveSessionCreateResponse
                        )

                    ReceiveSessionCreateResponse (Ok session) ->
                        ( { model
                            | session = Just session
                            , modalContent =
                                case model.modalContent of
                                    Just SignInRequired ->
                                        Nothing

                                    other ->
                                        other
                          }
                        , Cmd.none
                        )

                    SignOut ->
                        ( { model | session = Nothing }, signOut () )

                    CreateExecution ->
                        case model.session of
                            Nothing ->
                                ( { model | modalContent = Just SignInRequired }
                                , Cmd.batch [ renderGoogleSignInButton () ]
                                )

                            Just _ ->
                                ( model, Cmd.batch [ execute (Request.encode model.request) ] )

                    CloseModal ->
                        ( { model | modalContent = Nothing }, Cmd.none )

                    ExecutionProgress progress ->
                        ( model, Cmd.none )

                    other ->
                        let
                            _ =
                                Debug.log "unexpected Msg" other
                        in
                        ( model, Cmd.none )
        , view = view
        }


view model =
    div [ style "position" "relative" ]
        [ div
            [ class "fb-like"
            , attribute "data-action" "like"
            , attribute "data-href" "https://developers.facebook.com/docs/plugins/"
            , attribute "data-layout" "standard"
            , attribute "data-share" "true"
            , attribute "data-show-faces" "true"
            , attribute "data-size" "small"
            ]
            []
        , div [ id "fb-root" ] []
        , section []
            [ h1 [] [ text "walk30m.com" ]
            , p [] [ text "A handy and delightful isochronous solution" ]
            , model.session
                |> Maybe.map
                    (\(Session _ { displayName }) ->
                        p []
                            [ text displayName
                            , button [ onClick SignOut ] [ text "Sign Out" ]
                            ]
                    )
                |> Maybe.withDefault (p [] [])
            ]
        , div
            [ id "google-maps"
            , style "width" "800px"
            , style "height" "600px"
            , style "background" "#ddd"
            ]
            []
        , div [] [ button [ onClick CreateExecution ] [ text "Start" ] ]
        , modalView model
        ]


modalView model =
    div
        [ style "position" "fixed"
        , style "left" "0"
        , style "top" "0"
        , style "width" "100%"
        , style "height" "100%"
        , style "background" "rgba(0,0,0,.5)"
        , style "display"
            (model.modalContent
                |> Maybe.map (\_ -> "block")
                |> Maybe.withDefault "none"
            )
        ]
        [ case model.modalContent of
            Just SignInRequired ->
                div
                    [ style "background" "white", style "position" "fixed", style "padding" "2em" ]
                    [ p [] [ text "To continue, please sign in." ]
                    , div [ id "google-signin-button-container" ] []
                    , button [ onClick CloseModal ] [ text "Close" ]
                    ]

            Nothing ->
                div [] []
        ]
