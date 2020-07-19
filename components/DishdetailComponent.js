import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, StyleSheet, Modal, Button, Alert, PanResponder } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
})

function RenderDish(props) {

    const dish = props.dish;

    let viewRef;

    const recognizeDragRtoL = ({ dx, dy }) => {
        if ( dx < -100 )
            return true;
        else
            return false;
    }
    const recognizeDragLtoR = ({ dx, dy}) => {
        if (dx > 100 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {viewRef.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));},
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDragRtoL(gestureState)) {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            } else if(recognizeDragLtoR(gestureState)) {
                props.toggleModal();
            }

            return true;
        }
    })


    
    if (dish != null) {
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000} 
                ref={(ref) => {
                    viewRef=ref;
                }} 
                {...panResponder.panHandlers}
                >
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.iconStyle}>
                        <Icon
                            raised
                            reverse
                            name={props.favorite ? "heart" : "heart-o"}
                            type="font-awesome"
                            color="#f50"
                            onPress = { () => props.favorite ? console.log('Alredy favourite') : props.onPress()} />
                        <Icon
                            raised
                            reverse
                            name={"pencil"}
                            type="font-awesome"
                            color="#512DA8"
                            onPress = { () => props.toggleModal()} 
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    else {
        return(<View></View>);
    }
}


function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <View style={{marginRight: "auto"}}>
                    <Rating
                        ratingColor='#FFD700'
                        ratingBackgroundColor='#FFFFFF'
                        ratingCount={5}
                        startingValue={item.rating}
                        imageSize={10}       
                    />
                </View>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}


class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rating: 0,
            showModal: false,
            author: "Author",
            comment: "comment"
        }

        // this.ratingCompleted = this.ratingCompleted.bind(this)
    }

    resetForm() {
        this.setState({
            showModal:false,
            author: "author",
            comment:"comment"
        })
    }
   
    ratingCompleted(rating) {
        this.setState({
            rating: rating
        })
    }
      
    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    handleComment(dishId) {
        console.log(JSON.stringify(this.state));
        this.props.postComment(dishId, this.state.rating, this.state.author, this.state.comment);
        this.toggleModal();
        this.resetForm();
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');

        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]} favorite={this.props.favorites.some(el => el === dishId)} 
                onPress={() => this.markFavorite(dishId)} toggleModal={() => this.toggleModal()}/>
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === +dishId)} />
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => {this.toggleModal()}}
                    onRequestClose = {() => {this.toggleModal()}}>
                    <View>
                    <Rating
                        type='custom'
                        ratingColor='#FFD700'
                        ratingBackgroundColor='#FFFFFF'
                        ratingCount={5}
                        onFinishRating={this.ratingCompleted}
                        style={{ paddingVertical: 10 }}
                        showRating='true'
                        startingValue={0}
                        
                        />
                    <Input
                        placeholder='Author'
                        leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                        onChangeText={(author) => this.setState({author: author})}
                    />
                    <Input
                        placeholder='Comment'
                        leftIcon={{ type: 'font-awesome', name: 'comments-o'}}
                        onChangeText={(comment) => this.setState({comment: comment})}
                    />
                    <View style={{margin: 10}}>
                        <Button
                            onPress={() => this.handleComment(dishId)}
                            title="Submit"
                            color="#512DA8"
                            // accessibilityLabel="Learn more about this purple button"
                        />
                    </View>
                    <View style={{margin: 10}}>    
                        <Button
                            onPress={() => this.toggleModal()}
                            title="Cancel"
                            color="#616161"
                            // accessibilityLabel="Learn more about this purple button"
                        />
                    </View>
                    
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    iconStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row'
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);