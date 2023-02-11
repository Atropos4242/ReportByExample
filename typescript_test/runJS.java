static void main(){
    Context context = Context.create();
    Value result = context.eval("js", "40+2");
    assert result.asInt() == 42;
}

